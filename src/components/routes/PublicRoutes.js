import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import PageLayout from '../Layout/PageLayout';

// --------------- PAGES
import HomePage from "../../Pages/Home/HomePage";
import EventDetails from "../../Pages/Events/EventDetails";
import EventRegistration from "../../Pages/Events/EventRegistration";
import BookmarkedEvents from "../../Pages/Events/BookmarkedEvents";
import Contributors from "../Contributors";
import CommunityEvent from "../CommunityEvent";
import LeaderBoard from "../../Pages/Leaderboard/Leaderboard";
import ContributorGuide from "../../Pages/Leaderboard/ContributorGuide";
import AboutPage from "../../Pages/About/AboutPage";
import FAQPage from "../../Pages/FAQ/FAQPage";
import Terms from "../../Pages/Terms";
import { Privacy } from "../../Pages/Privacy";
import ApiDocs from "../../Pages/ApiDocs";
import HelpCenter from "../../Pages/HelpCenter";
import ContactUs from "../../Pages/Contact/ContactUs";
import FeedbackPage from "../../Pages/Feedback/FeedbackPage";
import FloorPlanDesignerPage from "../../Pages/Events/FloorPlanDesignerPage";
import DocumentationPage from "../../Pages/About/DocumentationPage";
import SubmitProject from "../../Pages/Projects/SubmitProject";
import MockApiResponse from "../MockApiResponse";

const EventsPage = lazy(() => import("../../Pages/Events/EventsPage"));
const HackathonPage = lazy(() => import("../../Pages/Hackathons/HackathonPage"));
const ProjectsPage = lazy(() => import("../../Pages/Projects/ProjectsPage"));
const EventAnalyticsDashboard = lazy(() => import("../../Pages/Events/EventAnalyticsDashboard"));