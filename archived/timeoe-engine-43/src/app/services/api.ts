export async function fetchData(endpoint: string): Promise<Data> {
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

export async function postData(endpoint: string, data: Data): Promise<Response> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response;
}