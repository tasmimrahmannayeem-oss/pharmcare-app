const calculateEMA = (data, period) => {
  if (!data || data.length === 0) return [];
  if (data.length === 1) return [data[0]];
  
  const k = 2 / (period + 1);
  const ema = [data[0]]; // Initial EMA is the first value
  
  for (let i = 1; i < data.length; i++) {
    const currentEma = (data[i] - ema[i - 1]) * k + ema[i - 1];
    ema.push(currentEma);
  }
  return ema;
};

const linearRegression = (data) => {
  if (!data || data.length === 0) return { slope: 0, intercept: 0, trend: 'stable' };
  if (data.length === 1) return { slope: 0, intercept: data[0], trend: 'stable' };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  const n = data.length;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += (i * data[i]);
    sumXX += (i * i);
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  let trend = 'stable';
  if (slope > 0.05) trend = 'up';
  else if (slope < -0.05) trend = 'down';

  return { slope, intercept, trend };
};

const generateSalesForecast = (orders, days = 7) => {
  if (!orders || orders.length === 0) {
    return {
      historicalData: [],
      forecast: [],
      trendDirection: 'stable',
      growthPercentage: 0,
      predictedRevenue: { weekly: 0, monthly: 0 }
    };
  }

  // Aggregate daily revenue
  const dailyRevenue = {};
  const today = new Date();
  
  // Initialize last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dailyRevenue[d.toISOString().split('T')[0]] = 0;
  }

  orders.forEach(order => {
    const d = new Date(order.createdAt).toISOString().split('T')[0];
    if (dailyRevenue[d] !== undefined) {
      dailyRevenue[d] += order.totalAmount;
    }
  });

  const revenueValues = Object.values(dailyRevenue);
  const emaValues = calculateEMA(revenueValues, 7);
  const regression = linearRegression(emaValues);
  
  const historicalData = Object.keys(dailyRevenue).map((date, index) => ({
    date,
    revenue: dailyRevenue[date],
    ema: emaValues[index]
  }));

  const forecast = [];
  const n = revenueValues.length;
  let weeklyPrediction = 0;
  let monthlyPrediction = 0;

  for (let i = 0; i < 30; i++) {
    const predictedValue = Math.max(0, regression.intercept + regression.slope * (n + i));
    
    if (i < days) {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      forecast.push({
        date: d.toISOString().split('T')[0],
        revenue: predictedValue
      });
    }

    if (i < 7) weeklyPrediction += predictedValue;
    monthlyPrediction += predictedValue;
  }

  // Calculate growth percentage based on slope and average
  const avgRevenue = revenueValues.reduce((a,b)=>a+b, 0) / (n || 1);
  const growthPercentage = avgRevenue > 0 ? (regression.slope * 7 / avgRevenue) * 100 : 0;

  return {
    historicalData,
    forecast,
    trendDirection: regression.trend,
    growthPercentage: parseFloat(growthPercentage.toFixed(2)),
    predictedRevenue: {
      weekly: parseFloat(weeklyPrediction.toFixed(2)),
      monthly: parseFloat(monthlyPrediction.toFixed(2))
    }
  };
};

const generateRestockPredictions = (medicines, orders) => {
  if (!medicines || medicines.length === 0) return [];
  
  // Aggregate medicine quantities from orders
  const medicineConsumption = {};
  let earliestOrderDate = new Date();
  
  (orders || []).forEach(order => {
    const orderDate = new Date(order.createdAt);
    if (orderDate < earliestOrderDate) earliestOrderDate = orderDate;
    
    order.medicines.forEach(m => {
      const id = m.medicine ? m.medicine.toString() : null;
      if (id) {
        if (!medicineConsumption[id]) medicineConsumption[id] = 0;
        medicineConsumption[id] += m.quantity;
      }
    });
  });

  // Calculate days passed
  const now = new Date();
  let daysPassed = Math.max(1, Math.ceil((now - earliestOrderDate) / (1000 * 60 * 60 * 24)));
  if (daysPassed > 60) daysPassed = 60;

  return medicines.map(med => {
    const consumption = medicineConsumption[med._id.toString()] || 0;
    const dailyConsumption = consumption / daysPassed;
    const currentStock = med.stockQuantity || 0;
    
    let daysUntilStockout = 999;
    if (dailyConsumption > 0) {
      daysUntilStockout = Math.floor(currentStock / dailyConsumption);
    } else if (currentStock === 0) {
        daysUntilStockout = 0;
    }

    // Safety stock = max daily usage (approx 1.5 * avg) * lead time (e.g., 3 days)
    const safetyStock = dailyConsumption * 1.5 * 3;
    const recommendedReorder = Math.ceil((dailyConsumption * 14) + safetyStock - currentStock);
    
    let urgency = 'healthy';
    if (daysUntilStockout < 7) urgency = 'critical';
    else if (daysUntilStockout <= 14) urgency = 'warning';

    // Expiry considerations
    let expiryAlert = false;
    if (med.expiryDate) {
      const expiry = new Date(med.expiryDate);
      const daysToExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      if (daysToExpiry < 30) {
        expiryAlert = true;
        if (urgency !== 'critical') urgency = 'warning'; 
      }
    }

    return {
      medicineId: med._id,
      name: med.name,
      currentStock,
      dailyConsumption: parseFloat(dailyConsumption.toFixed(2)),
      daysUntilStockout,
      recommendedReorder: Math.max(0, recommendedReorder),
      urgency,
      expiryAlert,
      expiryDate: med.expiryDate
    };
  }).sort((a, b) => {
    const rank = { 'critical': 1, 'warning': 2, 'healthy': 3 };
    return rank[a.urgency] - rank[b.urgency] || a.daysUntilStockout - b.daysUntilStockout;
  });
};

const detectSeasonalTrends = (orders) => {
  if (!orders || orders.length === 0) return {};
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
  const dayRevenue = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
  
  orders.forEach(order => {
    const d = new Date(order.createdAt);
    const day = daysOfWeek[d.getDay()];
    dayCounts[day]++;
    dayRevenue[day] += order.totalAmount;
  });

  return {
    dayCounts,
    dayRevenue
  };
};

const getTopPredictedProducts = (orders, limit = 5) => {
  if (!orders || orders.length === 0) return [];

  const productStats = {};
  
  orders.forEach(order => {
    order.medicines.forEach(m => {
      const id = m.medicine ? m.medicine.toString() : null;
      if (id) {
        if (!productStats[id]) {
          productStats[id] = { id, quantity: 0, revenue: 0 };
        }
        productStats[id].quantity += m.quantity;
        productStats[id].revenue += (m.price * m.quantity);
      }
    });
  });

  return Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
};

module.exports = {
  calculateEMA,
  linearRegression,
  generateSalesForecast,
  generateRestockPredictions,
  detectSeasonalTrends,
  getTopPredictedProducts
};
