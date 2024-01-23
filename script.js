let currentPage = 1;
let reposPerPage = 10;
let repositories = [];
let userDetails = {};
let loading = false;

function searchUser() {
  const username = document.getElementById("username").value;
  const userApiUrl = `https://api.github.com/users/${username}`;
  const reposApiUrl = `https://api.github.com/users/${username}/repos`;

  showLoader();

  Promise.all([fetch(userApiUrl), fetch(reposApiUrl)])
    .then((responses) => {
      hideLoader();

      const [userResponse, reposResponse] = responses;

      if (!userResponse.ok) {
        throw new Error("User not found");
      }

      return Promise.all([userResponse.json(), reposResponse.json()]);
    })
    .then((data) => {
      const [user, repos] = data;
      userDetails = user;
      repositories = repos;
      currentPage = 1;
      reposPerPage = 10;
      renderUserDetails();
      toggleRepoPerPageVisibility(true);
      renderPage(currentPage);
    })
    .catch((error) => {
      hideLoader();
      document.getElementById(
        "result"
      ).innerHTML = `<p class="text-danger">${error.message}</p>`;
      document.getElementById("pagination").style.display = "none";
      toggleRepoPerPageVisibility(false);
    });

  document.getElementById("reposPerPageSelect").value = "10";
}

function renderUserDetails() {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  const userDetailsDiv = document.createElement("div");
  userDetailsDiv.className = "col-md-12 repo-card";

  userDetailsDiv.innerHTML = `
                <div class="card">
                    <div class="card-body d-flex align-items-center">
                        <img src="${
                          userDetails.avatar_url
                        }" alt="Avatar" class="mr-3 profile-pic" style="max-width: 100px;">
                        <div>
                            <h5 class="card-title">${
                              userDetails.name || userDetails.login
                            }</h5>
                            <p class="card-text">${
                              userDetails.bio || "No bio available"
                            }</p>
                            <p class="card-text"><strong>Location:</strong> ${
                              userDetails.location || "Not specified"
                            }</p>
                            <p class="card-text"><strong>Company:</strong> ${
                              userDetails.company || "Not specified"
                            }</p>
                            <a href="${
                              userDetails.html_url
                            }" target="_blank" class="btn btn-primary">GitHub Account</a>
                        </div>
                    </div>
                </div>
            `;
  resultDiv.appendChild(userDetailsDiv);
}

function showLoader() {
  loading = true;
  document.getElementById("loader").style.display = "block";
  document.getElementById("pagination").style.display = "none";
}

function hideLoader() {
  loading = false;
  document.getElementById("loader").style.display = "none";
}

function renderPage(page) {
  const resultDiv = document.getElementById("result");

  if (userDetails.login) {
    renderUserDetails();
  }

  const startIdx = (page - 1) * reposPerPage;
  const endIdx = startIdx + reposPerPage;
  const pageRepos = repositories.slice(startIdx, endIdx);

  if (pageRepos.length === 0) {
    resultDiv.innerHTML += "<p>No repositories found for this user.</p>";
    document.getElementById("pagination").style.display = "none";
    return;
  }

  const repoPerPageContainer = document.getElementById("repoPerPageContainer");
  repoPerPageContainer.style.display = "block";

  for (const repo of pageRepos) {
    const technologies = repo.language ? [repo.language] : [];
    const topics = repo.topics || [];

    const card = document.createElement("div");
    card.className = "col-md-6 repo-card";

    card.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${repo.name}</h5>
                            <p class="card-text">${
                              repo.description || "No description available"
                            }</p>
                            <div>
                                ${technologies
                                  .map(
                                    (tech) =>
                                      `<button class="btn btn-info mr-2 mb-1">${tech}</button>`
                                  )
                                  .join("")}
                                ${topics
                                  .map(
                                    (topic) =>
                                      `<button class="btn btn-secondary mr-2 mb-1">${topic}</button>`
                                  )
                                  .join("")}
                            </div>
                        </div>
                    </div>
                `;
    resultDiv.appendChild(card);
  }

  document.getElementById("pagination").style.display = "block";
  updatePaginationButtons();
}

function updatePaginationButtons() {
  const prevPageButton = document.getElementById("prevPage");
  const nextPageButton = document.getElementById("nextPage");
  const pageList = document.getElementById("pageList");

  const totalPages = Math.ceil(repositories.length / reposPerPage);

  prevPageButton.classList.toggle("disabled", currentPage === 1);
  nextPageButton.classList.toggle("disabled", currentPage === totalPages);

  let pages = "";
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages += `<li class="page-item ${
        i === currentPage ? "active" : ""
      }"><a class="page-link" href="#" onclick="goToPage(${i})">${i}</a></li>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages +=
        '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
  }

  pageList.innerHTML = pages;
}

function goToPage(page) {
  currentPage = page;
  renderPage(currentPage);
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
}

function nextPage() {
  const totalPages = Math.ceil(repositories.length / reposPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage(currentPage);
  }
}

function applyRepoPerPage() {
  reposPerPage = parseInt(
    document.getElementById("reposPerPageSelect").value,
    10
  );
  currentPage = 1;
  renderPage(currentPage);
}

function toggleRepoPerPageVisibility(visible) {
  const repoPerPageContainer = document.getElementById("repoPerPageContainer");
  repoPerPageContainer.style.display = visible ? "block" : "none";
}
