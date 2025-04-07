document.addEventListener('DOMContentLoaded', () => {
  const categoriesContainer = document.getElementById('categories-container')
  const addCategoryBtn = document.getElementById('add-category-btn')
  const generatePlanBtn = document.getElementById('generate-plan-btn')
  const planOutput = document.getElementById('plan-output')
  const startDateInput = document.getElementById('start-date')
  const endDateInput = document.getElementById('end-date')
  const planNameInput = document.getElementById('plan-name')

  // Set default dates to today and next week
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  startDateInput.value = today.toISOString().split('T')[0]
  endDateInput.value = nextWeek.toISOString().split('T')[0]
  planNameInput.value = 'Weekly Plan'

  // Load saved data
  loadData()

  // Save categories to localStorage
  function saveCategories() {
    const categories = []
    document.querySelectorAll('.category').forEach((categoryDiv) => {
      const categoryName = categoryDiv.querySelector('.category-name').value
      const goals = []

      categoryDiv.querySelectorAll('.goal').forEach((goalDiv) => {
        goals.push({
          name: goalDiv.querySelector('.goal-name').value,
          occurrences: parseInt(
            goalDiv.querySelector('.goal-occurrences').value
          ),
        })
      })

      categories.push({
        name: categoryName,
        goals: goals,
      })
    })

    localStorage.setItem('weeklyPlanningCategories', JSON.stringify(categories))
  }

  // Save plan name to localStorage
  function savePlanName() {
    localStorage.setItem('weeklyPlanningPlanName', planNameInput.value)
  }

  // Load data from localStorage
  function loadData() {
    const savedCategories = localStorage.getItem('weeklyPlanningCategories')
    const savedPlanName = localStorage.getItem('weeklyPlanningPlanName')

    if (savedPlanName) {
      planNameInput.value = savedPlanName
    }

    if (savedCategories) {
      const categories = JSON.parse(savedCategories)
      categories.forEach((category) => {
        addCategoryToDOM(category.name, category.goals)
      })
    }
  }

  // Add change event listener for plan name
  planNameInput.addEventListener('change', savePlanName)

  // Add category to DOM
  function addCategoryToDOM(categoryName = '', goals = []) {
    const categoryDiv = document.createElement('div')
    categoryDiv.className = 'category'
    categoryDiv.innerHTML = `
            <div class="category-header">
                <input type="text" class="category-name" placeholder="Category Name" value="${categoryName}">
                <button class="btn secondary add-goal-btn">Add Goal</button>
            </div>
            <div class="goals-container"></div>
        `
    categoriesContainer.appendChild(categoryDiv)

    // Add existing goals
    goals.forEach((goal) => {
      addGoalToDOM(categoryDiv, goal.name, goal.occurrences)
    })

    // Add goal button click handler
    const addGoalBtn = categoryDiv.querySelector('.add-goal-btn')
    addGoalBtn.addEventListener('click', () => {
      addGoalToDOM(categoryDiv)
      saveCategories()
    })

    // Add input change handler for category name
    const categoryNameInput = categoryDiv.querySelector('.category-name')
    categoryNameInput.addEventListener('change', saveCategories)
  }

  // Add goal to DOM
  function addGoalToDOM(categoryDiv, goalName = '', occurrences = 1) {
    const goalsContainer = categoryDiv.querySelector('.goals-container')
    const goalDiv = document.createElement('div')
    goalDiv.className = 'goal'
    goalDiv.innerHTML = `
                <input type="text" class="goal-name" placeholder="Goal Name" value="${goalName}">
                <input type="number" class="goal-occurrences" min="1" value="${occurrences}">
                <button class="btn secondary remove-goal-btn">Remove</button>
            `
    goalsContainer.appendChild(goalDiv)

    // Remove goal button click handler
    const removeGoalBtn = goalDiv.querySelector('.remove-goal-btn')
    removeGoalBtn.addEventListener('click', () => {
      goalDiv.remove()
      saveCategories()
    })

    // Add input change handlers
    const goalNameInput = goalDiv.querySelector('.goal-name')
    const occurrencesInput = goalDiv.querySelector('.goal-occurrences')

    goalNameInput.addEventListener('change', saveCategories)
    occurrencesInput.addEventListener('change', saveCategories)
  }

  // Add category button click handler
  addCategoryBtn.addEventListener('click', () => {
    addCategoryToDOM()
    saveCategories()
  })

  // Generate plan button click handler
  generatePlanBtn.addEventListener('click', () => {
    const startDate = new Date(startDateInput.value)
    const endDate = new Date(endDateInput.value)
    const planName = planNameInput.value || 'Weekly Plan'

    if (startDate > endDate) {
      alert('End date must be after start date')
      return
    }

    planOutput.innerHTML = ''
    const categories = document.querySelectorAll('.category')

    // Add plan heading
    const planHeading = document.createElement('div')
    planHeading.className = 'plan-heading'
    planHeading.innerHTML = `
        <h2>${planName}</h2>
        <p class="plan-dates">${formatDate(startDate)} - ${formatDate(
      endDate
    )}</p>
    `
    planOutput.appendChild(planHeading)

    categories.forEach((category) => {
      const categoryName = category.querySelector('.category-name').value
      if (!categoryName) return

      const categoryDiv = document.createElement('div')
      categoryDiv.className = 'plan-category'
      categoryDiv.innerHTML = `<h3>${categoryName}</h3>`

      const goals = category.querySelectorAll('.goal')
      goals.forEach((goal) => {
        const goalName = goal.querySelector('.goal-name').value
        const occurrences = parseInt(
          goal.querySelector('.goal-occurrences').value
        )

        if (!goalName) return

        const goalDiv = document.createElement('div')
        goalDiv.className = 'plan-goal'

        const goalNameSpan = document.createElement('span')
        goalNameSpan.className = 'plan-goal-name'
        goalNameSpan.textContent = goalName

        const occurrencesDiv = document.createElement('div')
        occurrencesDiv.className = 'plan-occurrences'

        for (let i = 0; i < occurrences; i++) {
          const box = document.createElement('div')
          box.className = 'plan-box'
          occurrencesDiv.appendChild(box)
        }

        goalDiv.appendChild(goalNameSpan)
        goalDiv.appendChild(occurrencesDiv)
        categoryDiv.appendChild(goalDiv)
      })

      planOutput.appendChild(categoryDiv)
    })

    // Show print button if plan was generated
    const printPlanBtn = document.getElementById('print-plan-btn')
    if (planOutput.children.length > 0) {
      printPlanBtn.style.display = 'inline-block'
    } else {
      printPlanBtn.style.display = 'none'
    }
  })

  // Print button click handler
  document.getElementById('print-plan-btn').addEventListener('click', () => {
    window.print()
  })

  // Add formatDate helper function
  function formatDate(date) {
    // Get the date string in YYYY-MM-DD format
    const dateStr = date.toISOString().split('T')[0]
    // Create a new date using the date string
    const localDate = new Date(dateStr + 'T12:00:00')

    return localDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
})
