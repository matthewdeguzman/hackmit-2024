import { SUPER_SECRET_TOKEN } from '$env/static/private';

export function GET({ request }) {
	const bearer = request.headers.get('Authorization');
	if (!bearer) {
		return new Response('No headers provided', { status: 400 });
	}

	const token = bearer.split(' ')[1];
	if (token !== SUPER_SECRET_TOKEN) {
		return new Response('Invalid token', { status: 401 });
	}
}
