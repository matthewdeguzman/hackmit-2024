<script lang="ts">
	import SignIn from 'clerk-sveltekit/client/SignIn.svelte';
</script>

<div class="flex items-center justify-center h-screen">
	<div class="w-1/4">
		<SignIn redirectUrl="/dashboard" />
	</div>
</div>
