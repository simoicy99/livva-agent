export default function TenantListingPage({ params }: { params: { slug: string } }) {
    return (
        <div>
            <h1>Listing {params.slug}</h1>
            <p>This is a listing page for the listing with the slug {params.slug}</p>
            <p>The listing is {params.slug}</p>
            <p>The listing is {params.slug}</p>
        </div>
    )
}