import OpenAI from 'openai';
import { OPENAI_API_KEY, SUPER_SECRET_TOKEN } from '$env/static/private';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST({ request }) {
	const bearer = request.headers.get('Authorization');
	if (!bearer) {
		return new Response('No headers provided', { status: 400 });
	}

	const token = bearer.split(' ')[1];
	console.log(token);
	if (token !== SUPER_SECRET_TOKEN) {
		return new Response('Invalid token', { status: 401 });
	}

	const image = await request.arrayBuffer();
	const buffer = Buffer.from(image);
	if (!buffer) {
		return new Response('No image provided', { status: 400 });
	}
	const base64Image = buffer.toString('base64');

	const example_output = {
		title: 'Event Title',
		description: 'Event Description',
		start_time: 'Event Start Date',
		end_time: 'Event End Date',
		location: 'Event Location'
	};

	const response = await openai.chat.completions.create({
		model: 'gpt-4o',
		messages: [
			{
				role: 'system',
				content: `You are a helpful assistant who extrapolates information from posters. You should retrieve the title, description, start time and date in ISO format, end time and date in ISO format, and location of the event from the poster. If the poster does not contain the information, do not try to make it up. You should reply with the extracted information as follows: \n${JSON.stringify(example_output)}`
			},
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: 'Extract the title, description, start time, end time, and location of the event from this poster.'
					},
					{
						type: 'image_url',
						image_url: {
							url: `data:image/jpeg;base64,${base64Image}`
						}
					}
				]
			}
		],
		max_tokens: 150
	});
	return new Response(response.choices[0].message.content, { status: 200 });
}
