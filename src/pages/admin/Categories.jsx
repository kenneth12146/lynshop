import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/cloudinary'
import { Plus, Pencil, Trash2, X, Loader, ImagePlus } from 'lucide-react'

const emptyForm = { name: '', slug: '', image_url: '', is_active: true, order_index: 0 }

export const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('order_index')
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const generateSlug = (name) => {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    if (name === 'name') {
      setForm({ ...form, name: value, slug: generateSlug(value) })
    } else {
      setForm({ ...form, [name]: val })
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setImageFile(null)
    setImagePreview(null)
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url || '',
      is_active: cat.is_active,
      order_index: cat.order_index
    })
    setEditingId(cat.id)
    setImagePreview(cat.image_url || null)
    setImageFile(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)

    let image_url = form.image_url

    // Subir imagen a Cloudinary si hay una nueva
    if (imageFile) {
      setUploadingImage(true)
      image_url = await uploadImage(imageFile)
      setUploadingImage(false)
    }

    const payload = { ...form, image_url }

    if (editingId) {
      await supabase.from('categories').update(payload).eq('id', editingId)
    } else {
      await supabase.from('categories').insert(payload)
    }

    setSaving(false)
    setShowModal(false)
    fetchCategories()
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
  }

  const toggleActive = async (cat) => {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    fetchCategories()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2D2D2D]">Categorías</h1>
          <p className="text-sm text-gray-400 mt-1">{categories.length} categorías registradas</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#E8A4B8] hover:bg-[#d4829a] text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-pink-50"></div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl">🗂️</span>
          <p className="text-gray-400 mt-4">No hay categorías aún</p>
          <button onClick={openCreate} className="mt-4 text-pink-500 hover:underline text-sm">
            Crear primera categoría
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50 flex items-center gap-4"
            >
              {/* Imagen - ahora con object-contain para que se vea completa */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0 flex items-center justify-center">
                {cat.image_url ? (
                  <img 
                    src={cat.image_url} 
                    alt={cat.name} 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🗂️</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#2D2D2D] text-sm">{cat.name}</h3>
                <p className="text-xs text-gray-400">/{cat.slug}</p>
                <button
                  onClick={() => toggleActive(cat)}
                  className={`text-xs mt-1 px-2 py-0.5 rounded-full font-medium ${
                    cat.is_active
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {cat.is_active ? '✅ Activa' : '⛔ Inactiva'}
                </button>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="w-8 h-8 rounded-lg bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-500 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
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
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 z-10">

            {/* Header modal */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-serif font-bold text-[#2D2D2D]">
                {editingId ? 'Editar categoría' : 'Nueva categoría'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">

              {/* Imagen - vista previa con object-contain para que se vea completa */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Imagen de la categoría
                </label>
                <div className="flex gap-3 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-pink-50 border-2 border-dashed border-pink-200 flex items-center justify-center flex-shrink-0">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <ImagePlus className="w-6 h-6 text-pink-300" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer bg-pink-50 hover:bg-pink-100 border border-pink-100 rounded-xl px-4 py-3 text-sm text-pink-500 font-medium text-center transition-all">
                    {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej: Ropa, Accesorios..."
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="ropa, accesorios..."
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm bg-gray-50"
                />
              </div>

              {/* Orden */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Orden de aparición</label>
                <input
                  type="number"
                  name="order_index"
                  value={form.order_index}
                  onChange={handleChange}
                  min={0}
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm"
                />
              </div>

              {/* Activa */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 accent-pink-500"
                />
                <span className="text-sm font-medium text-gray-600">Categoría activa (visible en el catálogo)</span>
              </label>

              {/* Botón guardar */}
              <button
                onClick={handleSave}
                disabled={saving || uploadingImage}
                className="w-full bg-[#E8A4B8] hover:bg-[#d4829a] disabled:bg-pink-200 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {saving || uploadingImage ? (
                  <><Loader className="w-5 h-5 animate-spin" />
                  {uploadingImage ? 'Subiendo imagen...' : 'Guardando...'}</>
                ) : (
                  editingId ? '💾 Guardar cambios' : '✅ Crear categoría'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}