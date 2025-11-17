import { Pagination, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material'

function AdminPagination({ 
  page, 
  rowsPerPage, 
  totalItems, 
  onPageChange, 
  onRowsPerPageChange 
}) {
  const totalPages = Math.ceil(totalItems / rowsPerPage)

  if (totalItems === 0) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Rows per page</InputLabel>
        <Select
          value={rowsPerPage}
          label="Rows per page"
          onChange={onRowsPerPageChange}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
        </Select>
      </FormControl>
      <Pagination
        count={totalPages}
        page={page}
        onChange={onPageChange}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Box>
  )
}

export default AdminPagination