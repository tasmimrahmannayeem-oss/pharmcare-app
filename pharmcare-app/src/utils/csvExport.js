export const exportToCSV = (data, filename, headers) => {
  const csvRows = []
  
  // Add headers
  csvRows.push(headers.join(','))
  
  // Add data rows
  data.forEach(item => {
    const values = headers.map(header => {
      const field = header.toLowerCase().replace(/ /g, '')
      let val = item[field] || ''
      
      // Basic sanitization
      if (typeof val === 'string' && val.includes(',')) {
        val = `"${val}"`
      }
      return val
    })
    csvRows.push(values.join(','))
  })
  
  // Create blob and download
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.setAttribute('hidden', '')
  a.setAttribute('href', url)
  a.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
