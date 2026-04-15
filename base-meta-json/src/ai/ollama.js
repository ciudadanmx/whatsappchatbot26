const axios = require("axios")

const OLLAMA_URL = "http://llm.ciudadan.org:11434/api/generate"

async function askOllama(message) {
    try {
        const res = await axios.post(OLLAMA_URL, {
            model: "mistral",
            prompt: `
Eres un asistente útil, claro y directo.
Responde en español.

Usuario: ${message}
            `,
            stream: false
        }, {
            timeout: 15000
        })

        const text = res?.data?.response
        if (typeof text === "string" && text.trim().length > 0) {
            return text.trim()
        }

        return "No pude generar respuesta en este momento."
    } catch (err) {
        console.log("Ollama error:", err.message)
        return "Estoy teniendo problemas para responder en este momento."
    }
}

module.exports = { askOllama }