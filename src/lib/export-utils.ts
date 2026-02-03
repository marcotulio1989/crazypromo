/**
 * Utility functions for exporting data to JSON and CSV formats
 */

/**
 * Flattens a nested object for CSV export
 */
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key
    
    if (value === null || value === undefined) {
      result[newKey] = ''
    } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey))
    } else if (Array.isArray(value)) {
      // For arrays, just convert to string
      result[newKey] = JSON.stringify(value)
    } else if (value instanceof Date) {
      result[newKey] = value.toISOString()
    } else {
      result[newKey] = value
    }
  }
  
  return result
}

/**
 * Escapes a value for CSV format
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  const stringValue = String(value)
  
  // If the value contains a comma, newline, or double quote, wrap it in double quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

/**
 * Converts an array of objects to CSV format
 */
export function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) {
    return ''
  }
  
  // Flatten all objects
  const flattenedData = data.map(item => flattenObject(item))
  
  // Get all unique headers from all objects
  const headers = new Set<string>()
  flattenedData.forEach(item => {
    Object.keys(item).forEach(key => headers.add(key))
  })
  const headerArray = Array.from(headers)
  
  // Create CSV header row
  const headerRow = headerArray.map(h => escapeCSVValue(h)).join(',')
  
  // Create CSV data rows
  const dataRows = flattenedData.map(item => {
    return headerArray.map(header => escapeCSVValue(item[header])).join(',')
  })
  
  return [headerRow, ...dataRows].join('\n')
}

/**
 * Converts data to JSON string with proper formatting
 */
export function convertToJSON(data: unknown): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Gets the appropriate content type for the export format
 */
export function getContentType(format: 'json' | 'csv'): string {
  return format === 'csv' ? 'text/csv' : 'application/json'
}

/**
 * Gets the file extension for the export format
 */
export function getFileExtension(format: 'json' | 'csv'): string {
  return format === 'csv' ? 'csv' : 'json'
}
