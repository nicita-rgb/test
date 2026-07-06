import { useState } from 'react'

function App() {
  const [bgColor, setBgColor] = useState('#667eea')
  const [showPopup, setShowPopup] = useState(false)

  const generateRandomColor = () => {
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')
  }

  const changeColor = () => {
    setBgColor(generateRandomColor())
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3000)
  }

  return (
    <div
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
