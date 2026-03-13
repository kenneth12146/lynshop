import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Save, ImagePlus, Phone, Instagram, Facebook, Globe } from 'lucide-react'

export const Configuracion = () => {
  const [settings, setSettings] = useState({
    id: null,
    store_name: '',
    whatsapp_number: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    logo_url: '',
    welcome_message: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('*')
        .single()
      if (data) {
        // Sanitizar nulls → strings vacíos para evitar crash
        setSettings({
          id: data.id,
          store_name: data.store_name || '',
          whatsapp_number: data.whatsapp_number || '',
          instagram_url: data.instagram_url || '',
          facebook_url: data.facebook_url || '',
          tiktok_url: data.tiktok_url || '',
          logo_url: data.logo_url || '',
          welcome_message: data.welcome_message || ''
        })
        setLogoPreview(data.logo_url || null)
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('El logo no puede superar 2MB')
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setError(null)
  }

  const uploadLogo = async (file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `logo_${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(uploadData.path)

      return publicUrl
    } catch (err) {
      console.error('Error subiendo logo:', err)
      throw new Error('No se pudo subir el logo: ' + err.message)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      let logo_url = settings.logo_url

      if (logoFile) {
        logo_url = await uploadLogo(logoFile)
        setLogoFile(null)
      }

      const payload = {
        store_name: settings.store_name,
        whatsapp_number: settings.whatsapp_number,
        instagram_url: settings.instagram_url,
        facebook_url: settings.facebook_url,
        tiktok_url: settings.tiktok_url,
        logo_url,
        welcome_message: settings.welcome_message,
        updated_at: new Date().toISOString()
      }

      const { error: saveError } = await supabase
        .from('store_settings')
        .update(payload)
        .eq('id', settings.id)

      if (saveError) throw saveError

      setSettings(prev => ({ ...prev, logo_url }))
      setLogoPreview(logo_url || logoPreview)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)

    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2D2D2D]">Configuración</h1>
          <p className="text-sm text-gray-400 mt-1">Personaliza tu tienda</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#E8A4B8] hover:bg-[#d4829a] disabled:bg-pink-200 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-sm"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            </>
          ) : saved ? (
            <>✅ Guardado</>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar cambios
            </>
          )}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Info básica */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 space-y-5">
          <h2 className="font-serif font-bold text-[#2D2D2D]">📋 Información básica</h2>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">
              Logo de la tienda
            </label>
            <div className="flex gap-3 items-center">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-pink-50 border-2 border-dashed border-pink-200 flex items-center justify-center flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <ImagePlus className="w-6 h-6 text-pink-300" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <label className="block cursor-pointer bg-pink-50 hover:bg-pink-100 border border-pink-100 rounded-xl px-4 py-3 text-sm text-pink-500 font-medium text-center transition-all">
                  {logoFile ? `✅ ${logoFile.name}` : 'Seleccionar logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 text-center">PNG, JPG — máx. 2MB</p>
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Nombre de la tienda
            </label>
            <input
              type="text"
              name="store_name"
              value={settings.store_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:border-pink-400 text-sm bg-[#FAFAFA]"
              placeholder="LynShop"
            />
          </div>

          {/* Mensaje de bienvenida */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Mensaje de bienvenida
            </label>
            <textarea
              name="welcome_message"
              value={settings.welcome_message}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:border-pink-400 text-sm bg-[#FAFAFA] resize-none"
              placeholder="Descubre piezas únicas para ti..."
            />
          </div>
        </div>

        {/* Redes y contacto */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 space-y-5">
          <h2 className="font-serif font-bold text-[#2D2D2D]">📱 Contacto y redes</h2>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500" /> Número de WhatsApp
              </span>
            </label>
            <div className="flex">
              <span className="px-3 py-3 bg-pink-50 border border-r-0 border-pink-100 rounded-l-xl text-sm text-gray-500">
                +
              </span>
              <input
                type="text"
                name="whatsapp_number"
                value={settings.whatsapp_number}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-r-xl border border-pink-100 focus:outline-none focus:border-pink-400 text-sm bg-[#FAFAFA]"
                placeholder="573001234567"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Sin espacios ni +. Ej: 573001234567</p>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <span className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" /> Instagram URL
              </span>
            </label>
            <input
              type="url"
              name="instagram_url"
              value={settings.instagram_url}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:border-pink-400 text-sm bg-[#FAFAFA]"
              placeholder="https://instagram.com/lynshop"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <span className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-500" /> Facebook URL
              </span>
            </label>
            <input
              type="url"
              name="facebook_url"
              value={settings.facebook_url}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:border-pink-400 text-sm bg-[#FAFAFA]"
              placeholder="https://facebook.com/lynshop"
            />
          </div>

          {/* TikTok */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" /> TikTok URL
              </span>
            </label>
            <input
              type="url"
              name="tiktok_url"
              value={settings.tiktok_url}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:border-pink-400 text-sm bg-[#FAFAFA]"
              placeholder="https://tiktok.com/@lynshop"
            />
          </div>
        </div>
      </div>

      {/* Vista previa footer */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-pink-50">
        <h2 className="font-serif font-bold text-[#2D2D2D] mb-4">👀 Vista previa del footer</h2>
        <div className="bg-[#2D2D2D] text-white py-6 px-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xl font-serif font-bold text-pink-300">
            {settings.store_name || 'LynShop'}
          </p>
          <span className="flex items-center gap-2 bg-green-500 px-6 py-2 rounded-full font-semibold text-sm">
            📱 Contáctanos por WhatsApp
          </span>
          <div className="flex gap-4 text-sm">
            <span className={settings.instagram_url ? 'text-pink-400' : 'text-gray-600'}>Instagram</span>
            <span className={settings.facebook_url ? 'text-blue-400' : 'text-gray-600'}>Facebook</span>
            <span className={settings.tiktok_url ? 'text-white' : 'text-gray-600'}>TikTok</span>
          </div>
        </div>
      </div>
    </div>
  )
}
