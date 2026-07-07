import { useState, useEffect, useRef, useCallback } from 'react'

function App() {
  const [bgColor, setBgColor] = useState('#667eea')
  const [showPopup, setShowPopup] = useState(false)
  
  // Кинематическая физика ауры - ореал движется с ускорением и затуханием
  const auraRef = useRef({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2,
    auraElement: null,
    outerAuraElement: null
  })
  const velocityRef = useRef({ x: 0, y: 0 })
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const animationRef = useRef(null)
  
  // Сила притяжения (насколько быстро афера тянется к курсору)
  const springForce = 0.08
  // Затухание скорости (трение)
  const damping = 0.92
  
  const generateRandomColor = () => {
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')
  }

  const changeColor = () => {
    setBgColor(generateRandomColor())
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3000)
  }

  // Кинематическая анимация ауры с физикой пружины и затухания (непрерывный цикл)
  useEffect(() => {
    const animate = () => {
      const dx = mouseRef.current.x - auraRef.current.x
      const dy = mouseRef.current.y - auraRef.current.y
      
      // Ускорение от силы притяжения к курсору мыши
      velocityRef.current.x += dx * springForce
      velocityRef.current.y += dy * springForce
      
      // Затухание (трение/сопротивление воздуха)
      velocityRef.current.x *= damping
      velocityRef.current.y *= damping
      
      // Обновляем позицию ауры
      auraRef.current.x += velocityRef.current.x
      auraRef.current.y += velocityRef.current.y
      
      // Применяем позицию напрямую через DOM (без React рендера - максимальная производительность)
      if (auraRef.current.auraElement) {
        auraRef.current.auraElement.style.left = `${auraRef.current.x}px`
        auraRef.current.auraElement.style.top = `${auraRef.current.y}px`
      }
      if (auraRef.current.outerAuraElement) {
        auraRef.current.outerAuraElement.style.left = `${auraRef.current.x}px`
        auraRef.current.outerAuraElement.style.top = `${auraRef.current.y}px`
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const handleMouseMove = useCallback((e) => {
    mouseRef.current.x = e.clientX
    mouseRef.current.y = e.clientY
  }, [])

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        background: `linear-gradient(135deg, ${bgColor} 0%, #74b9f3 50%, #a6c0fe 100%)`,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        overflow: 'hidden',
        transition: 'background 0.5s ease',
        boxShadow: 'inset 0 0 50px rgba(255, 255, 255, 0.3)',
        position: 'relative',
      }}
    >
      <button
        onClick={changeColor}
        style={{
          padding: '20px 40px',
          fontSize: '22px',
          cursor: 'pointer',
          borderRadius: '16px',
          border: 'none',
          background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
          color: '#333',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.15),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5)
          `,
          fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
          fontWeight: '600',
          transform: `scale(${showPopup ? 1.1 : 1})`,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        Сменить цвет фона
      </button>

      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
            fontSize: '16px',
            zIndex: 1000,
            animation: 'fadeInOut 3s ease forwards',
          }}
        >
          Новый цвет: {bgColor}
        </div>
      )}

      {/* Aura / Ореал */}
      <div
        ref={(el) => { if (auraRef.current && el) auraRef.current.auraElement = el }}
        style={{
          position: 'fixed',
          left: `${auraRef.current.x}px`,
          top: `${auraRef.current.y}px`,
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%)`,
          pointerEvents: 'none',
          transform: `translate(-50%, -50%) scale(${showPopup ? 1.3 : 1})`,
          zIndex: 50,
          boxShadow: `
            0 0 60px rgba(255, 255, 255, 0.1),
            inset 0 0 40px rgba(255, 255, 255, 0.08)
          `,
        }}
      />

      {/* Второе кольцо ауры - внешнее */}
      <div
        ref={(el) => { if (auraRef.current && el) auraRef.current.outerAuraElement = el }}
        style={{
          position: 'fixed',
          left: `${auraRef.current.x}px`,
          top: `${auraRef.current.y}px`,
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 60%)`,
          pointerEvents: 'none',
          transform: `translate(-50%, -50%) scale(${showPopup ? 1.5 : 1})`,
          zIndex: 40,
        }}
      />

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}

export default App