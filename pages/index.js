import dynamic from 'next/dynamic'
import PasswordProtect from '../components/PasswordProtect'

// Dynamic import to avoid SSR issues
const ChromeModel = dynamic(() => import('../components/ChromeModel'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #333',
          borderTop: '3px solid #fff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p>Loading 3D Experience...</p>
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

const ThemeToggle = dynamic(() => import('../components/ThemeToggle'), {
  ssr: false
})

export default function Home() {
  return (
    <PasswordProtect>
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#111',
        transition: 'colors 300ms'
      }}>
        <ThemeToggle />
        <ChromeModel />
      </div>
    </PasswordProtect>
  )
}

export async function getStaticProps() {
  return {
    props: {},
  }
}