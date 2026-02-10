import Script from 'next/script'

export default function StructuredData() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: '수유수선 (Suyu Repair)',
        image: 'https://suyu.ai.kr/og-image.jpg', // Replace with actual image URL
        description: '가죽자켓, 코트, 청바지 등 모든 의류의 전문 수선 및 리폼 서비스를 제공합니다.',
        address: {
            '@type': 'PostalAddress',
            streetAddress: '강북구 도봉로 77길 13', // Example address, needs to be verified
            addressLocality: 'Seoul',
            addressRegion: 'KR',
            postalCode: '01133', // Example
            addressCountry: 'KR',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 37.6366, // Example coordinates
            longitude: 127.025,
        },
        url: 'https://suyu.ai.kr',
        telephone: '+82-10-1234-5678', // Example phone
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:00',
                closes: '19:00',
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Saturday',
                opens: '09:00',
                closes: '15:00',
            },
        ],
        priceRange: '₩₩',
        servesCuisine: 'Clothing Repair', // Technically not cuisine, but used for service in some contexts or just omit
    }

    // More specific Service schema
    const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: 'Clothing Repair',
        provider: {
            '@type': 'LocalBusiness',
            name: '수유수선 (Suyu Repair)',
        },
        areaServed: {
            '@type': 'City',
            name: 'Seoul',
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Repair Services',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Leather Jacket Repair',
                    },
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Jeans Repair',
                    },
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Coat Repair',
                    },
                },
            ],
        },
    }

    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                strategy="beforeInteractive" // Load early for SEO
            />
            <Script
                id="service-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
                strategy="beforeInteractive"
            />
        </>
    )
}
