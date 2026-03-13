import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader, Eye, EyeOff } from 'lucide-react';

// Componente de partículas
const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const colors = ['#F9C7D3', '#F8A5B2', '#FEE3E8', '#FFB6C1', '#FFC0CB']; // tonos rosados

    const initParticles = (width, height) => {
      const particleCount = 80;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        // Movimiento
        p.x += p.speedX;
        p.y += p.speedY;

        // Rebote en bordes
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        // Suavizar al borde
        if (p.x < 0) p.x = 0;
        if (p.x > canvas.width) p.x = canvas.width;
        if (p.y < 0) p.y = 0;
        if (p.y > canvas.height) p.y = canvas.height;
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />;
};

export const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError('Correo o contraseña incorrectos');
      setLoading(false);
      return;
    }

    navigate('/admin/dashboard');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-[#F5E6D3] flex items-center justify-center px-4 overflow-hidden">
      {/* Fondo de partículas */}
      <ParticlesBackground />

      {/* Contenedor con animación de entrada */}
      <div className="relative z-10 w-full max-w-md animate-[fadeIn_0.6s_ease-out]">
        {/* Logo con aparición suave */}
        <div className="text-center mb-8 animate-[slideUp_0.5s_ease-out]">
          <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
            LynShop
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Panel de administración</p>
        </div>

        {/* Tarjeta con efecto de elevación */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-100 transition-all duration-300 hover:shadow-pink-200/50 hover:scale-[1.01]">
          <h2 className="text-xl font-bold text-[#2D2D2D] mb-6 text-center">
            🔐 Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="admin@lynshop.com"
                className="w-full border border-pink-100 rounded-xl px-4 py-3 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent 
                  transition-all duration-200 hover:border-pink-200"
              />
            </div>

            {/* Campo Password con visibilidad toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 pr-12 text-sm 
                    focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent 
                    transition-all duration-200 hover:border-pink-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje de error con animación shake */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-500 text-sm text-center animate-[shake_0.3s_ease-in-out]">
                ❌ {error}
              </div>
            )}

            {/* Botón de submit con gradiente y animación de carga */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 
                disabled:opacity-60 text-white py-3 rounded-xl font-semibold 
                transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                flex items-center justify-center gap-2 shadow-lg hover:shadow-pink-200"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar al panel'
              )}
            </button>
          </form>
        </div>

        {/* Pie de página */}
        <p className="text-center text-gray-300 text-xs mt-6 animate-pulse">
          Solo acceso autorizado
        </p>
      </div>

      {/* Estilos adicionales para keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
};