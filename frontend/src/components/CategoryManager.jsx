import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useToast } from '../hooks/useToast'
import FormInput from './FormInput'
import LoadingSpinner from './LoadingSpinner'

export default function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: '#0ea5e9' })
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const { addToast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.getCategories()
      setCategories(response.data)
    } catch (error) {
      addToast('Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      addToast('Category name is required', 'error')
      return
    }

    try {
      await api.createCategory({
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color,
        display_order: categories.length + 1
      })
      addToast('Category added successfully', 'success')
      setNewCategory({ name: '', description: '', color: '#FF6B35' })
      setShowAddForm(false)
      fetchCategories()
    } catch (error) {
      addToast(error.message || 'Failed to add category', 'error')
    }
  }

  const handleUpdateCategory = async (id) => {
    try {
      await api.updateCategory(id, editValues[id])
      addToast('Category updated successfully', 'success')
      setEditingId(null)
      setEditValues({})
      fetchCategories()
    } catch (error) {
      addToast(error.message || 'Failed to update category', 'error')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return

    try {
      await api.deleteCategory(id)
      addToast('Category deleted successfully', 'success')
      fetchCategories()
    } catch (error) {
      addToast(error.message || 'Failed to delete category', 'error')
    }
  }

  if (loading) return <LoadingSpinner size="md" />

  return (
    <div className="form-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Expense Categories</h3>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ minHeight: '40px', padding: '8px 16px' }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <FormInput
            label="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            placeholder="e.g., Rent, Supplies"
          />
          <FormInput
            label="Description (Optional)"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            placeholder="e.g., Monthly rent payment"
          />
          <div className="form-group">
            <label className="form-label">Color</label>
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              style={{ width: '60px', height: '40px', cursor: 'pointer', borderRadius: '4px' }}
            />
          </div>
          <button className="btn-primary" onClick={handleAddCategory} style={{ marginTop: '12px' }}>
            Add Category
          </button>
        </div>
      )}

      {/* Categories List */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: editingId === cat.id ? '#f9f9f9' : '#fff'
            }}
          >
            {/* Color Indicator */}
            <div
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: cat.color,
                borderRadius: '4px',
                flexShrink: 0
              }}
            />

            {/* Category Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingId === cat.id ? (
                <div style={{ display: 'grid', gap: '8px' }}>
                  <FormInput
                    label="Name"
                    value={editValues[cat.id]?.name || cat.name}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        [cat.id]: { ...editValues[cat.id], name: e.target.value }
                      })
                    }
                  />
                  <FormInput
                    label="Description"
                    value={editValues[cat.id]?.description || cat.description || ''}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        [cat.id]: { ...editValues[cat.id], description: e.target.value }
                      })
                    }
                  />
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{cat.name}</div>
                  {cat.description && (
                    <div style={{ fontSize: '14px', color: '#666' }}>{cat.description}</div>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {editingId === cat.id ? (
                <>
                  <button
                    className="btn-success"
                    onClick={() => handleUpdateCategory(cat.id)}
                    style={{ minHeight: '36px', padding: '6px 12px', fontSize: '14px' }}
                  >
                    Save
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setEditingId(null)
                      setEditValues({})
                    }}
                    style={{ minHeight: '36px', padding: '6px 12px', fontSize: '14px' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setEditingId(cat.id)
                      setEditValues({ [cat.id]: { name: cat.name, description: cat.description } })
                    }}
                    style={{ minHeight: '36px', padding: '6px 12px', fontSize: '14px' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteCategory(cat.id)}
                    style={{ minHeight: '36px', padding: '6px 12px', fontSize: '14px' }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          No categories found. Add one to get started!
        </div>
      )}

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#999' }}>
        Total: {categories.length} categories
      </div>
    </div>
  )
}
