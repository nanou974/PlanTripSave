import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.setIcon(DefaultIcon)

export default function HomePage({ user, setUser }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  const API_URL = 'http://localhost:5000/api'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isLogin 
            ? { email: formData.email, password: formData.password }
            : { 
                name: formData.name,
                email: formData.email, 
                password: formData.password,
                confirmPassword: formData.confirmPassword
              }
        )
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Une erreur est survenue')
        return
      }

      if (isLogin && data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        window.location.href = '/dashboard'
      } else if (!isLogin) {
        setError('Inscription réussie! Veuillez vous connecter.')
        setTimeout(() => setIsLogin(true), 2000)
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✈️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">PlanTripSave</h1>
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Déconnexion
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Carte */}
          <div className="h-96 lg:h-full rounded-2xl overflow-hidden shadow-lg">
            <MapContainer
              center={[46.5, 2.2]}
              zoom={6}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Marker position={[46.5, 2.2]}>
                <Popup>Centre de la France 🇫🇷</Popup>
              </Marker>
              <Marker position={[48.8566, 2.3522]}>
                <Popup>Paris 🗼</Popup>
              </Marker>
              <Marker position={[43.2965, 5.3698]}>
                <Popup>Marseille 🌊</Popup>
              </Marker>
              <Marker position={[45.7640, 4.8357]}>
                <Popup>Lyon 🏛️</Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Formulaire */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {user ? `Bienvenue, ${user.name}! 👋` : 'Planifiez vos voyages'}
              </h2>
              <p className="text-xl text-gray-600">
                Planifier • Voyager • Économiser
              </p>
            </div>

            {!user ? (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                {/* Toggle */}
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => {
                      setIsLogin(true)
                      setError('')
                      setFormData({ email: '', password: '', name: '', confirmPassword: '' })
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                      isLogin
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => {
                      setIsLogin(false)
                      setError('')
                      setFormData({ email: '', password: '', name: '', confirmPassword: '' })
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                      !isLogin
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Inscription
                  </button>
                </div>

                {/* Erreur */}
                {error && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    error.includes('réussie') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {error}
                  </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required={!isLogin}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Jean Dupont"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le mot de passe
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required={!isLogin}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-6">
                    <p className="text-gray-700">
                      <strong>Email:</strong> {user.email}
                    </p>
                  </div>
                  <button
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    📍 Commencer un nouveau voyage
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
