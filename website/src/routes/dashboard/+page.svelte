<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;
	const userId = data && data.userId;
</script>
