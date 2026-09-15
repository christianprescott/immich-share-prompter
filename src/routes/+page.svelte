<script>
	const { data } = $props();
</script>

<p>
	Visit <a href={data.immichHost}>your Immich instance</a>
</p>
<p>
	Maybe you want to share a photo from {data.cities.join(', ')}
</p>
