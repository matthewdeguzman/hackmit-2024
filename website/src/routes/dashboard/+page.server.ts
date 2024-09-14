import type { PageServerLoad } from './types';

export const load: PageServerLoad = async ({ locals }) => {
	console.log('session locals', locals.session);
	return {
		userId: locals.session.userId
	}
};
