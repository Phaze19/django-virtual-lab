from django.urls import path
from . import views

urlpatterns = [
    path("", views.experiments, name="experiments"),
    path("introduction/", views.information, {"section": "introduction"}, name="introduction"),
    path("objective/", views.information, {"section": "objective"}, name="objective"),
    path("target-audience/", views.information, {"section": "target_audience"}, name="target_audience"),
    path("course-alignment/", views.information, {"section": "course_alignment"}, name="course_alignment"),
    path("feedback/", views.information, {"section": "feedback"}, name="feedback"),
    path("experiments/<slug:slug>/", views.lesson, name="lesson"),
    path("experiments/<slug:slug>/feedback/", views.experiment_feedback, name="experiment_feedback"),
    path("experiments/<slug:slug>/<str:section>/", views.lesson_section, name="lesson_section"),
]
