const apiKey = "AIzaSyB921tjUJ_We3ZjsXIfTkPq2gc7AkmVKEg";
const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

const listModelsFetch = async () => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Models:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Fetch Error:", error);
    }
};

listModelsFetch();
