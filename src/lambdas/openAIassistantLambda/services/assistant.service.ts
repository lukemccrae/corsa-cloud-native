export const chatCompletionAssistant = async (messages: string[], ASSISTANTS_API_KEY: string) => {
    try {
        const url = 'https://api.openai.com/v1/chat/completions';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ASSISTANTS_API_KEY}`
        };

        const messages = [
            {
                "role": "system",
                "content": "You are a trail running coach. "
            },
            {
                "role": "user",
                "content": "generate workout details for this trail running race."
            },
            {
                "role": "user",
                "content": "courseDetails includes arrays of strings for course info,GAP means 'grade adjusted pace' and is equivilant flat pace for vertical miles Give serious analysis in two sentences of feedback to the runner about their abilities hitting these times. "
            },
            {
                "role": "user",
                "content": "compare PR times with GAP. Are they realistically able to achieve these times and the required training? Give either yes or no."
            },
            {
                "role": "user",
                "content": "Included are 2 PRs from the last year.Please respond with three workouts helping the runner target: 1. GAP paces 2. terrain challenges 3. endurance requirements"
            },
            {
                "role": "user",
                "content": "Give me JSON with: Feedback, workout array with name and description"
            },
            {
                "role": "user",
                "content": "{\"courseDetails\":{\"mile\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\",\"8\",\"9\",\"10\",\"11\",\"12\",\"13\",\"0.34\"],\"pace\":[\"8:55\",\"9:13\",\"8:29\",\"11:11\",\"10:14\",\"16:34\",\"13:53\",\"13:21\",\"11:44\",\"10:37\",\"10:34\",\"9:10\",\"9:12\",\"9:34\"],\"gain\":[\"499\",\"522\",\"433\",\"686\",\"515\",\"1142\",\"686\",\"0\",\"0\",\"0\",\"3\",\"0\",\"0\",\"0\"],\"loss\":[\"0\",\"0\",\"0\",\"-3\",\"0\",\"0\",\"-361\",\"-1188\",\"-679\",\"-594\",\"-466\",\"-509\",\"-472\",\"-197\"],\"gap\":[\"4:28\",\"4:37\",\"4:15\",\"5:36\",\"5:07\",\"5:31\",\"6:57\",\"15:59\",\"13:15\",\"11:56\",\"11:34\",\"10:18\",\"10:15\",\"9:34\"]},\"routeLengthInMiles\":13.34,\"formData\":{\"experienceLevel\":\"I'm new to things like this\",\"description\":\"This is a trail up a big mountain with summit at 14k feet! It has a little technical terrain but is mostly runnable. The trail starts at like 8k feet. The course I want to run is only the first 7.3 miles so you can ignore the rest of the miles\",\"pr1Type\":\"5k\",\"pr2Type\":\"Half Marathon\",\"pr1Time\":\"00:16:52\",\"pr2Time\":\"01:20:45\"},\"cumulativeGain\":4486,\"cumulativeLoss\":-4469}"

            }
        ]

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: messages
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (e) {
        console.log(e, 'chat completion assistant error')
    }
}