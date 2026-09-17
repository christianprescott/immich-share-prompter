<script>
	import { ImageCard } from '@immich/ui';

	// A transparent placeholder image satisfies src prop without a network request
	const placeholderItem = {
		title: '',
		href: '',
		src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
	};
</script>

<div class="relative mt-3 overflow-hidden whitespace-nowrap rounded-xl">
	<ImageCard item={placeholderItem} class="pointer-events-none opacity-20" />
	<ImageCard item={placeholderItem} class="pointer-events-none opacity-10" />
	<ImageCard item={placeholderItem} class="pointer-events-none opacity-5" />
	<div
		class="absolute inset-0 mask-b-from-0 animate-shimmer bg-[length:200%_100%] bg-[image:linear-gradient(100deg,transparent_30%,rgba(255,255,255,0.4)_50%,transparent_70%)] bg-no-repeat motion-reduce:animate-none"
	></div>
	<span class="sr-only">Loading photos...</span>
</div>
