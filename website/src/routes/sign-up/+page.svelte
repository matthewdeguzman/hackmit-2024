<script lang="ts">
	import SignUp from 'clerk-sveltekit/client/SignUp.svelte';
</script>

<div class="flex items-center justify-center h-screen">
	<div class="w-1/2">
		<SignUp redirectUrl="/dashboard" />
	</div>
</div>