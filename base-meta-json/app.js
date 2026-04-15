require('dotenv').config({ path: `${__dirname}/.env` })

const { askOllama } = require("./src/ai/ollama")

const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const MetaProvider = require('@bot-whatsapp/provider/meta')
const JsonFileAdapter = require('@bot-whatsapp/database/json')

/**
 * 🤖 FLOW PRINCIPAL
 */
const flowAI = addKeyword(EVENTS.WELCOME).addAction(async (ctx, { flowDynamic }) => {

    const message = (ctx.body || '').trim()

    if (!message) {
        await flowDynamic('¡Hola! Soy tu asistente. ¿En qué te puedo ayudar?')
        return
    }

    const normalized = message.toLowerCase()
    const isGreeting = /^(hola|buenas|buenos dias|buen día|buenas tardes|buenas noches|que tal|qué tal)\b/.test(normalized)

    console.log("📩 USER:", message)

    if (isGreeting) {
        await flowDynamic('¡Hola! Soy tu asistente. ¿En qué te puedo ayudar?')
        return
    }

    try {
        const response = await askOllama(message)
        await flowDynamic(response)
        return
    } catch (err) {
        console.log("❌ FLOW ERROR:", err.message)
        await flowDynamic("No pude responder en este momento, intenta de nuevo.")
        return
    }
})

/**
 * 🚀 INIT BOT
 */
const main = async () => {

    const adapterDB = new JsonFileAdapter()

    const adapterFlow = createFlow([
        flowAI
    ])

    const adapterProvider = createProvider(MetaProvider, {
        jwtToken: process.env.JWT_TOKEN,
        numberId: process.env.NUMBER_ID,
        verifyToken: process.env.VERIFY_TOKEN,
        version: process.env.VERSION || 'v16.0',
        port: process.env.PORT ? Number(process.env.PORT) : 3000
    })

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    console.log("🤖 Bot con Ollama corriendo correctamente")
}

main()