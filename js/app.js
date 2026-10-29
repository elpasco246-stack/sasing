/* Shared behaviour: navigation state, progress, quizzes, reflection saving */
(function () {
  "use strict";

  var PAGES = ["index.html", "objectives.html", "content.html", "activities.html", "summary.html"];
  var KEY = "exe-sample-visited";

  function safeGet(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function safeSet(k, v) {
    try { localStorage.setItem(k, v); } catch (e) { /* ignore */ }
  }

  function currentPage() {
    var p = location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }

  /* ---- Visited pages + progress bar ---- */
  var visited = [];
  try { visited = JSON.parse(safeGet(KEY) || "[]"); } catch (e) { visited = []; }
  var page = currentPage();
  if (visited.indexOf(page) === -1) {
    visited.push(page);
    safeSet(KEY, JSON.stringify(visited));
  }

  document.querySelectorAll("nav.sidebar a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === page) a.classList.add("active");
    if (visited.indexOf(href) !== -1 && href !== page) a.classList.add("visited");
  });

  var bar = document.querySelector(".progress > div");
  if (bar) bar.style.width = Math.round((visited.length / PAGES.length) * 100) + "%";

  /* ---- Multiple choice / true-false ---- */
  document.querySelectorAll("form.quiz").forEach(function (form) {
    var scoreBox = form.querySelector(".score");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var questions = form.querySelectorAll(".question");
      var correct = 0;

      questions.forEach(function (q) {
        var answer = q.getAttribute("data-answer");
        var chosen = q.querySelector("input:checked");
        var fb = q.querySelector(".feedback");

        q.querySelectorAll("label").forEach(function (l) {
          l.classList.remove("correct", "incorrect");
        });

        if (!chosen) {
          fb.textContent = "Please choose an answer.";
          fb.className = "feedback bad";
          return;
        }

        var label = chosen.closest("label");
        if (chosen.value === answer) {
          correct++;
          label.classList.add("correct");
          fb.textContent = "Correct! " + (q.getAttribute("data-explain") || "");
          fb.className = "feedback ok";
        } else {
          label.classList.add("incorrect");
          fb.textContent = "Not quite. " + (q.getAttribute("data-hint") || "Try again.");
          fb.className = "feedback bad";
        }
      });

      scoreBox.style.display = "block";
      scoreBox.textContent = "Score: " + correct + " / " + questions.length;
    });

    var reset = form.querySelector("button[type=reset]");
    if (reset) {
      reset.addEventListener("click", function () {
        form.querySelectorAll("label").forEach(function (l) {
          l.classList.remove("correct", "incorrect");
        });
        form.querySelectorAll(".feedback").forEach(function (f) {
          f.textContent = "";
          f.className = "feedback";
        });
        scoreBox.style.display = "none";
      });
    }
  });

  /* ---- Reflection box (saved in this browser only) ---- */
  document.querySelectorAll("textarea.reflect").forEach(function (ta) {
    var id = "exe-sample-reflect-" + ta.id;
    var saved = safeGet(id);
    if (saved) ta.value = saved;
    ta.addEventListener("input", function () { safeSet(id, ta.value); });
  });

  /* ---- Reset progress link ---- */
  var resetLink = document.getElementById("reset-progress");
  if (resetLink) {
    resetLink.addEventListener("click", function (e) {
      e.preventDefault();
      try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
      location.reload();
    });
  }
})();
