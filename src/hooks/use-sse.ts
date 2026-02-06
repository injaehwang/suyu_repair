import { useEffect, useRef } from 'react';

export function useSSE(onMessage: (event: MessageEvent) => void) {
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/sse/notifications`;

        // Create EventSource connection
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            // Logic to parse event.data if needed, currently passing raw event
            onMessage(event);
        };

        eventSource.onopen = () => {
            console.log('SSE Connected');
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();
            // Optional: Logic to reconnect
        };

        return () => {
            eventSource.close();
            console.log('SSE Disconnected');
        };
    }, []); // Empty dependency array ensures one connection on mount

    return eventSourceRef.current;
}
