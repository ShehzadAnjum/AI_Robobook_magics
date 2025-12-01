export default function Home() {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      lineHeight: '1.6'
    }}>
      <h1>🤖 AI & Robotics Book Chat API</h1>

      <p>
        Backend API for the AI & Robotics Book with intelligent chat,
        conversation history, and learning journey tracking.
      </p>

      <h2>Status</h2>
      <p style={{ color: 'green', fontWeight: 'bold' }}>✅ API is running</p>

      <h2>Available Endpoints</h2>
      <ul>
        <li>
          <code>POST /api/chat</code> - Stream AI chat responses
        </li>
        <li>
          <code>GET /api/history/:sessionId</code> - Get conversation history
        </li>
        <li>
          <code>GET /api/analytics/:sessionId</code> - Get learning analytics
        </li>
      </ul>

      <h2>Quick Test</h2>
      <p>Test the chat endpoint:</p>
      <pre style={{
        background: '#f4f4f4',
        padding: '1rem',
        borderRadius: '4px',
        overflow: 'auto'
      }}>
{`curl -X POST https://YOUR_DOMAIN/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "What is a PID controller?"}'`}
      </pre>

      <h2>Documentation</h2>
      <p>
        See the <a href="https://github.com/YOUR_USERNAME/robotics-book-chat-api"
        style={{ color: '#0070f3' }}>GitHub repository</a> for full documentation.
      </p>

      <h2>Frontend Integration</h2>
      <p>
        This API is designed to work with the AI & Robotics Book hosted at:{' '}
        <a href="https://shehzadanjum.github.io/AI_Robotics_Bppl/"
        style={{ color: '#0070f3' }}>
          shehzadanjum.github.io/AI_Robotics_Bppl
        </a>
      </p>

      <footer style={{
        marginTop: '3rem',
        paddingTop: '1rem',
        borderTop: '1px solid #eee',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        <p>
          Powered by <strong>Next.js</strong>, <strong>Vercel Postgres</strong>,
          and <strong>Google Gemini</strong>
        </p>
      </footer>
    </div>
  );
}
