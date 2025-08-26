
const form = document.querySelector("form");
const searchInput = document.querySelector("#search-input");
const resultsGrid = document.querySelector("#results-grid");

async function searchRecipes(keyword) {
  try {
    resultsGrid.innerHTML = "<p>Searching for recipes...</p>";

    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${keyword}`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    displayRecipes(data.meals);
  } catch (error) {
    console.error("Error fetching data:", error);
    resultsGrid.innerHTML = "<p>An error occurred. Please try again later.</p>";
  }
}

function displayRecipes(meals) {
    const resultsGrid = document.getElementById('results-grid');
    
    if (!meals) {
        resultsGrid.innerHTML = '<p class="status-message">No recipes found.</p>';
        return;
    }
    
    resultsGrid.innerHTML = '';
    
    meals.forEach(meal => {
        // สร้าง meal card พร้อม data-meal-id
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        mealCard.setAttribute('data-meal-id', meal.idMeal); // สำคัญ!
        mealCard.style.cursor = 'pointer'; // แสดงว่าคลิกได้
        
        mealCard.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>
        `;
        
        resultsGrid.appendChild(mealCard);
    });
    
    console.log('แสดงผลลัพธ์:', meals.length, 'รายการ');
}

form.addEventListener("submit", (event) => {
  event.preventDefault(); 
  const keyword = searchInput.value.trim();
  if (keyword) {
    searchRecipes(keyword);
  }
});

// Global variables สำหรับ DOM elements
let mealDetailsSection = null;
let resultsContainer = null;

// Function เพื่อ initialize DOM elements
function initializeDOMElements() {
    mealDetailsSection = document.getElementById('meal-details-section');
    resultsContainer = document.getElementById('results-container');
    
    // Test ว่า elements ถูกเลือกมาได้หรือไม่
    console.log('Meal details section:', mealDetailsSection);
    console.log('Results container:', resultsContainer);
}

// Function สำหรับแสดงหน้ารายละเอียด
function showMealDetailsPage() {
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (mealDetailsSection) mealDetailsSection.classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Function สำหรับแสดงหน้าค้นหา
function showSearchPage() {
    if (mealDetailsSection) mealDetailsSection.classList.add('hidden');
    if (resultsContainer) resultsContainer.style.display = 'block';
}

// เรียกใช้ initialize เมื่อ DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', initializeDOMElements);

// Event delegation สำหรับจับการคลิกที่ meal cards
function setupMealCardClickHandlers() {
    const resultsGrid = document.getElementById('results-grid');
    
    resultsGrid.addEventListener('click', function(event) {
        console.log('คลิกที่:', event.target);
        
        // หา meal card ที่ใกล้ที่สุด
        const mealCard = event.target.closest('.meal-card');
        
        if (mealCard) {
            const mealId = mealCard.getAttribute('data-meal-id');
            console.log('คลิกที่ meal ID:', mealId);
            
            if (mealId) {
                // เรียกฟังก์ชันเพื่อโหลดรายละเอียด
                loadMealDetails(mealId);
            }
        }
    });
    
    console.log('ติดตั้ง event listener สำหรับ meal cards แล้ว');
}

function setupBackButtonHandler() {
    const backButton = document.getElementById('back-to-search-btn');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            console.log('กดปุ่มกลับ');
            showSearchPage();
        });
        
        console.log('ติดตั้ง event listener สำหรับปุ่มกลับแล้ว');
    }
}

// อัปเดตฟังก์ชัน initializeDOMElements
function initializeDOMElements() {
    mealDetailsSection = document.getElementById('meal-details-section');
    resultsContainer = document.getElementById('results-container');
    
    // ติดตั้ง event handlers
    setupMealCardClickHandlers();
    setupBackButtonHandler();
    
    console.log('Initialize DOM elements และ event handlers เสร็จแล้ว');
}

// Placeholder function สำหรับโหลดรายละเอียด (จะทำจริงในข้อต่อไป)
function loadMealDetails(mealId) {
    console.log('กำลังโหลดรายละเอียดสำหรับ meal ID:', mealId);
    
    // แสดงหน้ารายละเอียดก่อน (เพื่อทดสอบการทำงาน)
    showMealDetailsPage();
    
    // แสดง loading state
    document.getElementById('details-loading').classList.remove('hidden');
    document.getElementById('meal-details-content').classList.add('hidden');
    document.getElementById('details-error').classList.add('hidden');
    
    // TODO: จะเพิ่มการเรียก API จริงในข้อ 1.4
}

async function fetchMealDetails(mealId) {
    console.log('กำลังดึงข้อมูลรายละเอียดสำหรับ ID:', mealId);
    
    const apiUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
    console.log('API URL:', apiUrl);
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log('ข้อมูลที่ได้จาก API:', data);
        
        if (data.meals && data.meals.length > 0) {
            return data.meals[0]; // return meal object
        } else {
            throw new Error('ไม่พบข้อมูลอาหาร');
        }
    } catch (error) {
        console.error('Error fetching meal details:', error);
        throw error;
    }
}

function processMealIngredients(meal) {
    const ingredients = [];
    
    // วนลูปเพื่อรวบรวมส่วนผสมจาก strIngredient1-20 และ strMeasure1-20
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        
        // ตรวจสอบว่ามีส่วนผสมหรือไม่
        if (ingredient && ingredient.trim() !== '') {
            let ingredientText = '';
            
            if (measure && measure.trim() !== '') {
                ingredientText = `${measure.trim()} ${ingredient.trim()}`;
            } else {
                ingredientText = ingredient.trim();
            }
            
            ingredients.push(ingredientText);
        }
    }
    
    console.log('ส่วนผสมที่ประมวลผลแล้ว:', ingredients);
    return ingredients;
}

function displayMealDetailsContent(meal) {
    console.log('แสดงรายละเอียดของ:', meal.strMeal);
    
    const contentDiv = document.getElementById('meal-details-content');
    const ingredients = processMealIngredients(meal);
    
    // สร้าง HTML สำหรับแสดงรายละเอียด
    const detailsHTML = `
        <div class="meal-header">
            <div class="meal-image">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            </div>
            <div class="meal-info">
                <h1>${meal.strMeal}</h1>
                <p><strong>หมวดหมู่:</strong> ${meal.strCategory || 'ไม่ระบุ'}</p>
                <p><strong>ประเทศ:</strong> ${meal.strArea || 'ไม่ระบุ'}</p>
                ${meal.strTags ? `<p><strong>แท็ก:</strong> ${meal.strTags}</p>` : ''}
            </div>
        </div>
        
        <div class="ingredients-section">
            <h2>🥘 ส่วนผสม</h2>
            <ul class="ingredients-list">
                ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
        </div>
        
        <div class="instructions-section">
            <h2>👨‍🍳 วิธีทำ</h2>
            <div class="instructions-text">${meal.strInstructions || 'ไม่มีข้อมูลวิธีทำ'}</div>
        </div>
        
        ${meal.strYoutube ? `
            <div class="video-section">
                <h2>📺 วิดีโอการทำ</h2>
                <a href="${meal.strYoutube}" target="_blank" class="video-link">
                    ดูวิดีโอใน YouTube
                </a>
            </div>
        ` : ''}
    `;
    
    contentDiv.innerHTML = detailsHTML;
}

async function loadMealDetails(mealId) {
    console.log('เริ่มโหลดรายละเอียดสำหรับ meal ID:', mealId);
    
    // แสดงหน้ารายละเอียดและ loading state
    showMealDetailsPage();
    
    const loadingDiv = document.getElementById('details-loading');
    const contentDiv = document.getElementById('meal-details-content');
    const errorDiv = document.getElementById('details-error');
    
    // แสดง loading, ซ่อนส่วนอื่น
    loadingDiv.classList.remove('hidden');
    contentDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    
    try {
        // เรียก API
        const meal = await fetchMealDetails(mealId);
        
        // แสดงรายละเอียด
        displayMealDetailsContent(meal);
        
        // ซ่อน loading, แสดง content
        loadingDiv.classList.add('hidden');
        contentDiv.classList.remove('hidden');
        
    } catch (error) {
        console.error('ไม่สามารถโหลดรายละเอียดได้:', error);
        
        // แสดง error message
        errorDiv.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
        errorDiv.classList.remove('hidden');
        loadingDiv.classList.add('hidden');
    }
}

// เพิ่มฟังก์ชันทดสอบ (optional)
function testMealDetails() {
    // ทดสอบด้วย Meal ID ที่รู้ว่ามีข้อมูล
    loadMealDetails('52772'); // Teriyaki Chicken Casserole
}

// สามารถเรียกใน console เพื่อทดสอบ: testMealDetails()