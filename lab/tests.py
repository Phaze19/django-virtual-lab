from django.test import Client, TestCase

from .models import Feedback


class FeedbackFlowTests(TestCase):
    def test_feedback_model_can_be_created(self):
        feedback = Feedback.objects.create(message="This experiment was helpful.")
        self.assertEqual(feedback.message, "This experiment was helpful.")

    def test_feedback_form_submits_and_redirects(self):
        client = Client()
        response = client.post(
            "/experiments/template-variables/feedback/",
            {"message": "I learned a lot from the variables section."},
            follow=True,
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Thank you")
        self.assertTrue(Feedback.objects.filter(message="I learned a lot from the variables section.").exists())


class SimulationPagesTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_all_simulation_pages_load_successfully(self):
        slugs = [
            "template-variables",
            "template-inheritance",
            "template-loops",
            "template-filters",
        ]
        for slug in slugs:
            url = f"/experiments/{slug}/simulation/"
            response = self.client.get(url)
            self.assertEqual(response.status_code, 200, f"Failed loading {url}")
            self.assertContains(response, "Interactive Simulation Workbench")
            self.assertContains(response, "simulation.js")
            self.assertContains(response, "simulation.css")


class PaginationTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_main_sections_have_pagination(self):
        response = self.client.get("/introduction/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "page-pagination")
        self.assertContains(response, "Objective")

    def test_experiment_sections_have_pagination(self):
        response = self.client.get("/experiments/template-variables/simulation/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "page-pagination")
        self.assertContains(response, "Procedure")
        self.assertContains(response, "Posttest")


class AdminRegistrationTests(TestCase):
    def test_admin_login_page_renders(self):
        client = Client()
        response = client.get("/admin/login/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Django administration")


