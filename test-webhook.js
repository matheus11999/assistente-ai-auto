// Script para testar o webhook localmente
const testWebhook = async () => {
  const webhookUrl = 'http://localhost:54321/functions/v1/whatsapp-webhook'
  
  const testMessage = {
    key: {
      remoteJid: '5511999999999@s.whatsapp.net',
      fromMe: false
    },
    message: {
      conversation: 'frontal do galaxy s20'
    },
    pushName: 'Cliente Teste',
    messageTimestamp: Date.now()
  }

  try {
    console.log('🧪 Testando webhook...')
    console.log('📨 Dados enviados:', JSON.stringify(testMessage, null, 2))
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5YWx5bWNtY3Vmcm5uYmtxa21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NDUxMDYsImV4cCI6MjA3MDAyMTEwNn0.cpGxpvlMvwxG1qEXPjBOad-3nOAl05kXoWlra_n4geA'
      },
      body: JSON.stringify(testMessage)
    })

    const result = await response.json()
    console.log('📋 Status:', response.status)
    console.log('📋 Resposta:', result)
    
    if (response.ok) {
      console.log('✅ Webhook funcionando!')
    } else {
      console.log('❌ Erro no webhook:', result)
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message)
  }
}

// Executar teste se estiver rodando diretamente
if (import.meta.main) {
  testWebhook()
}

export { testWebhook }