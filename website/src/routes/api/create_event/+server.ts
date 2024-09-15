import OpenAI from 'openai';
import { OPENAI_API_KEY, SUPER_SECRET_TOKEN } from '$env/static/private';
import { EventTheme } from '@prisma/client';
import prisma from '$lib/prisma';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const themes: string = Object.values(EventTheme).join(', ');

export async function GET({ request, url }) {
	const bearer = request.headers.get('Authorization');
	if (!bearer) {
		return new Response('No headers provided', { status: 400 });
	}

	const token = bearer.split(' ')[1];
	if (token !== SUPER_SECRET_TOKEN) {
		return new Response('Invalid token', { status: 401 });
	}

	const downloadUrl = url.searchParams.get('url');
	if (!downloadUrl) {
		return new Response('No image provided', { status: 400 });
	}

	const example_output = {
		title: 'Event Title',
		description: 'Event Description',
		start_time: 'Event Start Date',
		end_time: 'Event End Date',
		location: 'Event Location',
		tags: ['tag 1', 'tag 2', 'tag 3']
	};

	const response = await openai.chat.completions.create({
		model: 'gpt-4o',
		messages: [
			{
				role: 'system',
				content: `You are a helpful assistant who extrapolates information from posters. You should retrieve the title, description, start time and date in ISO format, end time and date in ISO format, and location of the event from the poster. If the poster does not contain the information, do not try to make it up. Furthermore, you should classify the event into a list of tags that closely match the vibe of the event from one of the following classifications: ${themes}. You should reply with the extracted information as follows: \n${JSON.stringify(example_output)}`
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
							url: downloadUrl
						}
					}
				]
			}
		],
		max_tokens: 150
	});

	const content = response.choices[0].message.content;
	if (!content) {
		return new Response('Could not extract event information', { status: 400 });
	}

	try {
		const ev = JSON.parse(content);
		await prisma.event.create({
			data: {
				title: ev.title ?? undefined,
				description: ev.description ?? undefined,
				startTime: new Date(ev.start_time ?? ''),
				endTime: new Date(ev.end_time ?? ''),
				location: ev.location ?? undefined,
				themes: ev.tags ?? undefined
			}
		});
	} catch (e) {
		console.error(e);
		return new Response('Could not extract post event information', { status: 400 });
	}

	return new Response(content, { status: 200 });
}
