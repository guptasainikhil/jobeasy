// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Add click event listener for the MBTI button
    document.getElementById('mbtiButton').addEventListener('click', function() {
        // Redirect to the MBTI page
        window.location.href = 'quiz.html'; 
    });

    // Add click event listener for the Skillset button
    document.getElementById('skillsetButton').addEventListener('click', function() {
        // Redirect to the Skillset page
        window.location.href = 'skillset.html'; 
    });
});
