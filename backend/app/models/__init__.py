"""
global Orators ORM Models
"""

from app.models.user import User
from app.models.client import Client
from app.models.exercise import Exercise
from app.models.program import TrainingProgram
from app.models.workout import ScheduledWorkout
from app.models.metric import MetricEntry
from app.models.personal_record import PersonalRecord
from app.models.habit import ClientDailyHabitLog
from app.models.photo import ProgressPhoto
from app.models.message import ChatMessage
from app.models.activity import ActivityFeedItem
from app.models.inquiry import Inquiry
from app.models.otp import EmailOTP
from app.models.journal import JournalEntry
from app.models.simulation import SimulationEntry
from app.models.recording import AudioRecording
from app.models.inbound_email import InboundEmail
from app.models.group import ChatGroup

__all__ = [
    "User",
    "Client",
    "Exercise",
    "TrainingProgram",
    "ScheduledWorkout",
    "MetricEntry",
    "PersonalRecord",
    "ClientDailyHabitLog",
    "ProgressPhoto",
    "ChatMessage",
    "ChatGroup",
    "ActivityFeedItem",
    "Inquiry",
    "EmailOTP",
    "JournalEntry",
    "SimulationEntry",
    "AudioRecording",
    "InboundEmail",
]
