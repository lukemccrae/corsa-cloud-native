export const chatCompletionAssistant = async (messages: string[], ASSISTANTS_API_KEY: string) => {
    try {
        const url = 'https://api.openai.com/v1/chat/completions';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ASSISTANTS_API_KEY}`
        };

        const messagesForAssistant = [
            {
                "role": "system",
                "content": "I need you to read my article and provide me some results that I will describe."
            },
            ...messages.map(message => ({
                "role": "user",
                "content": message
              }))
        ]

        

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: messagesForAssistant
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return data;
    } catch (e) {
        console.log(e, 'chat completion assistant error')
    }
}