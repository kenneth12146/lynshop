import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/cloudinary'
import { Plus, Pencil, Trash2, X, Loader, ImagePlus, Star } from 'lucide-react'

const emptyForm = {
  name: '', description: '', price: '', stock: '',
  category_id: '', is_active: true, is_featured: false
}

export const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, categories(name), product_images(*)')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').eq('is_active', true)
    setCategories(data || [])
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const formatPrice = (price) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(price)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setImageFiles(prev => [...prev, ...files])
    const previews = files.map(f => URL.createObjectURL(f))
    setImagePreviews(prev => [...prev, ...previews])
  }

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = async (img) => {
    await supabase.from('product_images').delete().eq('id', img.id)
    setExistingImages(prev => prev.filter(i => i.id !== img.id))
  }

  const setMainImage = async (img) => {
    await supabase.from('product_images').update({ is_main: false }).eq('product_id', editingId)
    await supabase.from('product_images').update({ is_main: true }).eq('id', img.id)
    setExistingImages(prev => prev.map(i => ({ ...i, is_main: i.id === img.id })))
  }

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setImageFiles([])
    setImagePreviews([])
    setExistingImages([])
    setShowModal(true)
  }

  const openEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || '',
      is_active: product.is_active,
      is_featured: product.is_featured
    })
    setEditingId(product.id)
    setImageFiles([])
    setImagePreviews([])
    setExistingImages(product.product_images || [])
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return
    setSaving(true)

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id || null,
      is_active: form.is_active,
      is_featured: form.is_featured
    }

    let productId = editingId

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId)
    } else {
      const { data } = await supabase.from('products').insert(payload).select().single()
      productId = data.id
    }

    // Subir nuevas imágenes a Cloudinary
    if (imageFiles.length > 0) {
      const hasMainImage = existingImages.some(img => img.is_main)

      for (let i = 0; i < imageFiles.length; i++) {
        const url = await uploadImage(imageFiles[i])
        await supabase.from('product_images').insert({
          product_id: productId,
          image_url: url,
          is_main: !hasMainImage && i === 0,
          order_index: existingImages.length + i
        })
      }
    }

    setSaving(false)
    setShowModal(false)
    fetchProducts()
  }

  const handleDelete = async (product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return
    await supabase.from('product_images').delete().eq('product_id', product.id)
    await supabase.from('products').delete().eq('id', product.id)
    fetchProducts()
  }

  const toggleFeatured = async (product) => {
    await supabase.from('products').update({ is_featured: !product.is_featured }).eq('id', product.id)
    fetchProducts()
  }

  const getMainImage = (product) => {
    const main = product.product_images?.find(img => img.is_main)
    return main?.image_url || product.product_images?.[0]?.image_url || null
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2D2D2D]">Productos</h1>
          <p className="text-sm text-gray-400 mt-1">{products.length} productos registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#E8A4B8] hover:bg-[#d4829a] text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-pink-50"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl">📦</span>
          <p className="text-gray-400 mt-4">No hay productos aún</p>
          <button onClick={openCreate} className="mt-4 text-pink-500 hover:underline text-sm">
            Crear primer producto
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`flex items-center gap-4 p-4 ${
                index !== products.length - 1 ? 'border-b border-pink-50' : ''
              }`}
            >
              {/* Imagen */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                {getMainImage(product) ? (
                  <img src={getMainImage(product)} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#2D2D2D] text-sm truncate">{product.name}</h3>
                  {product.is_featured && (
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[#E8A4B8] font-bold text-sm">{formatPrice(product.price)}</span>
                  <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                  {product.categories && (
                    <span className="text-xs text-gray-400 bg-pink-50 px-2 py-0.5 rounded-full">
                      {product.categories.name}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    product.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {product.is_active ? '✅ Activo' : '⛔ Inactivo'}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleFeatured(product)}
                  title={product.is_featured ? 'Quitar destacado' : 'Marcar destacado'}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    product.is_featured
                      ? 'bg-amber-100 text-amber-500'
                      : 'bg-gray-50 text-gray-300 hover:bg-amber-50 hover:text-amber-400'
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(product)}
                  className="w-8 h-8 rounded-lg bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-500 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-serif font-bold text-[#2D2D2D]">
                {editingId ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">

              {/* Imágenes existentes */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Imágenes actuales
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {existingImages.map(img => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.image_url}
                          alt=""
                          className={`w-16 h-16 object-cover rounded-xl border-2 cursor-pointer transition-all ${
                            img.is_main ? 'border-[#E8A4B8]' : 'border-transparent hover:border-pink-200'
                          }`}
                          onClick={() => setMainImage(img)}
                          title="Click para hacer principal"
                        />
                        {img.is_main && (
                          <span className="absolute -top-1 -right-1 bg-[#E8A4B8] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            ★
                          </span>
                        )}
                        <button
                          onClick={() => removeExistingImage(img)}
                          className="absolute -top-1 -left-1 bg-red-400 text-white rounded-full w-4 h-4 items-center justify-center hidden group-hover:flex"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Click en una imagen para hacerla principal ★</p>
                </div>
              )}

              {/* Subir nuevas imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  {existingImages.length > 0 ? 'Agregar más imágenes' : 'Imágenes del producto'}
                </label>
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-2">
                    {imagePreviews.map((preview, i) => (
                      <div key={i} className="relative group">
                        <img src={preview} alt="" className="w-16 h-16 object-cover rounded-xl border-2 border-pink-100" />
                        <button
                          onClick={() => removeNewImage(i)}
                          className="absolute -top-1 -left-1 bg-red-400 text-white rounded-full w-4 h-4 items-center justify-center hidden group-hover:flex"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 cursor-pointer bg-pink-50 hover:bg-pink-100 border-2 border-dashed border-pink-200 rounded-xl px-4 py-4 text-sm text-pink-500 font-medium transition-all">
                  <ImagePlus className="w-5 h-5" />
                  Seleccionar imágenes (puedes elegir varias)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej: Blusa floral manga corta"
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe el producto..."
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm resize-none"
                />
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Precio (COP) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="35000"
                    min={0}
                    className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="10"
                    min={0}
                    className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm bg-white"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Switches */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 accent-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-600">Producto activo (visible en catálogo)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={form.is_featured}
                    onChange={handleChange}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <span className="text-sm font-medium text-gray-600">⭐ Producto destacado (aparece en Home)</span>
                </label>
              </div>

              {/* Botón guardar */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#E8A4B8] hover:bg-[#d4829a] disabled:bg-pink-200 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><Loader className="w-5 h-5 animate-spin" /> Guardando...</>
                ) : (
                  editingId ? '💾 Guardar cambios' : '✅ Crear producto'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
