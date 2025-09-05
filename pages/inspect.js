import dynamic from 'next/dynamic'

const ModelInspectorClient = dynamic(() => import('../app_backup/inspect/page'), {
  ssr: false,
  loading: () => (
    <div style={{
      padding: '2rem',
      backgroundColor: '#1f2937',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #374151',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>Loading Model Inspector...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
})

export default function InspectPage() {
  return <ModelInspectorClient />
}