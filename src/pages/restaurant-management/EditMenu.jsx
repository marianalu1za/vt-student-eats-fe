import { useState, useEffect, useMemo, useCallback } from 'react'
import { MaterialReactTable } from 'material-react-table'
import { MRT_Localization_EN } from 'material-react-table/locales/en'
import { InputAdornment, Checkbox } from '@mui/material'
import './EditMenu.css'
import { fetchMyMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../../api/restaurants'
import ErrorPopup from '../../components/common/ErrorPopup'
import ConfirmationMessage from '../../components/common/ConfirmationMessage'
import ConfirmDialog from '../../components/common/ConfirmDialog'

function EditMenu({ restaurantId, restaurant }) {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadMenuItems = useCallback(async () => {
    if (!restaurantId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await fetchMyMenuItems(restaurantId)
      setMenuItems(data || [])
    } catch (err) {
      console.error('Failed to fetch menu items:', err)
      // Ensure error message is user-friendly and not HTML
      let errorMessage = err.message || 'Failed to load menu items'
      // Remove any HTML tags if present
      errorMessage = errorMessage.replace(/<[^>]*>/g, '').trim()
      // Limit length to prevent huge error messages
      if (errorMessage.length > 500) {
        errorMessage = errorMessage.substring(0, 500) + '...'
      }
      setError(errorMessage)
      setShowErrorPopup(true)
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  useEffect(() => {
    loadMenuItems()
  }, [loadMenuItems])

  const handleCreateRow = async ({ exitCreatingMode, values }) => {
    try {
      // Ensure price is a number
      const priceValue = typeof values.price === 'string' ? parseFloat(values.price) : values.price
      
      // Create new item
      const createData = {
        restaurant_id: restaurantId,
        name: values.name?.trim() || '',
        price: priceValue,
        tags: values.tags?.trim() || '',
        // is_popular is not included - it's managed separately via the checkbox toggle
      }
      
      const newItem = await createMenuItem(createData)
      
      setMenuItems(prevItems => [...prevItems, newItem])
      setSuccessMessage('Menu item created successfully!')
      setShowSuccessPopup(true)
      exitCreatingMode()
    } catch (err) {
      console.error('Failed to create menu item:', err)
      // Ensure error message is user-friendly
      let errorMessage = err.message || 'Failed to create menu item'
      errorMessage = errorMessage.replace(/<[^>]*>/g, '').trim()
      if (errorMessage.length > 500) {
        errorMessage = errorMessage.substring(0, 500) + '...'
      }
      setError(errorMessage)
      setShowErrorPopup(true)
      // Don't exit creating mode on error so user can fix and retry
    }
  }

  const handleUpdateRow = async ({ exitEditingMode, row, values }) => {
    try {
      // Ensure price is a number
      const priceValue = typeof values.price === 'string' ? parseFloat(values.price) : values.price
      
      // Update existing item
      const updateData = {
        name: values.name?.trim() || '',
        price: priceValue,
        tags: values.tags?.trim() || '',
        // is_popular is not included - it's managed separately via the checkbox toggle
      }
      
      const updatedItem = await updateMenuItem(row.original.id, updateData)
      
      // Update the menu items state with the updated item
      setMenuItems(prevItems => 
        prevItems.map(item => 
          item.id === updatedItem.id ? { ...item, ...updatedItem } : item
        )
      )
      
      setSuccessMessage('Menu item updated successfully!')
      setShowSuccessPopup(true)
      exitEditingMode()
    } catch (err) {
      console.error('Failed to update menu item:', err)
      // Ensure error message is user-friendly
      let errorMessage = err.message || 'Failed to update menu item'
      errorMessage = errorMessage.replace(/<[^>]*>/g, '').trim()
      if (errorMessage.length > 500) {
        errorMessage = errorMessage.substring(0, 500) + '...'
      }
      setError(errorMessage)
      setShowErrorPopup(true)
      // Don't exit editing mode on error so user can fix and retry
    }
  }

  const handleDeleteClick = (row) => {
    setItemToDelete(row.original)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    try {
      setIsDeleting(true)
      await deleteMenuItem(itemToDelete.id)
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id))
      setSuccessMessage('Menu item deleted successfully!')
      setShowSuccessPopup(true)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (err) {
      console.error('Failed to delete menu item:', err)
      setError(err.message || 'Failed to delete menu item')
      setShowErrorPopup(true)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        enableEditing: true,
        muiEditTextFieldProps: {
          required: true,
          error: false,
        },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 120,
        enableEditing: true,
        Cell: ({ cell }) => {
          const value = cell.getValue()
          if (value === null || value === undefined) return '-'
          const numValue = typeof value === 'string' ? parseFloat(value) : value
          return typeof numValue === 'number' && !isNaN(numValue) ? `$${numValue.toFixed(2)}` : value
        },
        muiEditTextFieldProps: {
          type: 'number',
          required: true,
          placeholder: '0.00',
          InputProps: {
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          },
          helperText: 'Enter price in dollars (e.g., 9.99 for $9.99)',
          inputProps: {
            min: 0.01,
            step: 0.01,
          },
        },
        filterVariant: 'range',
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
        size: 200,
        enableEditing: true,
        Cell: ({ cell }) => cell.getValue() || '-',
        muiEditTextFieldProps: {
          placeholder: 'Comma-separated tags',
        },
      },
      {
        accessorKey: 'is_popular',
        header: 'Popular',
        size: 150,
        enableEditing: false, // do not use MRT editing for this field
        Cell: ({ row }) => {
          const value = row.original.is_popular

          return (
            <Checkbox
              checked={!!value}
              onChange={async (e) => {
                const newValue = e.target.checked

                // If trying to check a new item, verify we don't exceed the limit of 3
                if (newValue && !value) {
                  const currentPopularCount = menuItems.filter(item => item.is_popular === true).length
                  if (currentPopularCount >= 3) {
                    // Already at max, show error and prevent change
                    setError('You can only mark up to 3 items as popular. Please uncheck another popular item first.')
                    setShowErrorPopup(true)
                    return // Don't proceed with the change
                  }
                }

                // optimistic UI update
                setMenuItems((prev) =>
                  prev.map((item) =>
                    item.id === row.original.id
                      ? { ...item, is_popular: newValue }
                      : item
                  )
                )

                try {
                  // send PATCH to backend
                  await updateMenuItem(row.original.id, {
                    is_popular: newValue,
                  })
                } catch (err) {
                  console.error('Failed to update is_popular', err)

                  // revert on error
                  setMenuItems((prev) =>
                    prev.map((item) =>
                      item.id === row.original.id
                        ? { ...item, is_popular: value }
                        : item
                    )
                  )
                  
                  setError(err.message || 'Failed to update popular status')
                  setShowErrorPopup(true)
                }
              }}
            />
          )
        },
      },
    ],
    [menuItems]
  )

  if (loading) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Edit Menu</h1>
          <p>Loading menu items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-content">
      <div className="admin-page-header">
        <h1>Edit Menu</h1>
        <p>Manage menu items for {restaurant?.name || 'this restaurant'}</p>
      </div>

      <div className="admin-card">
        <MaterialReactTable
          columns={columns}
          data={menuItems}
          enableEditing
          enableColumnActions={false}
          enableColumnFilters={false}
          enablePagination={true}
          enableSorting={true}
          enableBottomToolbar={true}
          enableTopToolbar={true}
          localization={{
            ...MRT_Localization_EN,
            createRow: 'Create New Menu Item',
            editRow: 'Edit Menu Item',
          }}
          onEditingRowSave={handleUpdateRow}
          onCreatingRowSave={handleCreateRow}
          renderRowActions={({ row, table }) => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => table.setEditingRow(row)}
                style={{ fontSize: '0.875rem', padding: '6px 12px' }}
              >
                Edit
              </button>
              <button
                className="admin-btn admin-btn-danger"
                onClick={() => handleDeleteClick(row)}
                style={{ fontSize: '0.875rem', padding: '6px 12px' }}
              >
                Delete
              </button>
            </div>
          )}
          renderTopToolbarCustomActions={({ table }) => (
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => {
                table.setCreatingRow(true)
              }}
              style={{ fontSize: '0.875rem', padding: '8px 16px' }}
            >
              Create New Menu Item
            </button>
          )}
          createDisplayMode="modal"
          editDisplayMode="modal"
          initialState={{
            pagination: { pageSize: 10, pageIndex: 0 },
            showGlobalFilter: true,
          }}
          muiTableContainerProps={{
            sx: { maxHeight: '600px' },
          }}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            },
          }}
        />
      </div>

      {showErrorPopup && (
        <ErrorPopup
          message={error}
          onClose={() => {
            setShowErrorPopup(false)
            setError(null)
          }}
        />
      )}

      {showSuccessPopup && (
        <ConfirmationMessage
          message={successMessage}
          onClose={() => {
            setShowSuccessPopup(false)
            setSuccessMessage('')
          }}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}

export default EditMenu
