from datetime import timedelta
import uuid
from fastapi.testclient import TestClient
import pytest
from apps.device.models import Device, DeviceBindingSetting
from apps.onboarding.models import OnboardingSession
from apps.user.models import User, UserLoginSession
from core import main
from core.db import Base as CoreBase
from tests.utils import get_client


def session_setup(session):
    CoreBase.metadata.create_all(bind=session.bind)
    # second_user and third_user have no security_phrase and passcode
    # session.bulk_save_objects([first_user,second_user,third_user,fourth_user, fifth_user,sixth_user])
    session.add_all(
        [
            User(
                email="jhon@gmail.com",
                name="Jhon",
                security_phrase="My name is Jhon Doe.",
                passcode="13215456",
                profile_picture="https://test.png",
                id_number="1111111111111",
                is_active=True,
                phone_number="60222222222",
                onboarding_session_id=uuid.UUID("e8034a33-c15f-43d7-9fc0-25b72223119e"),
            ),
            User(
                email="Sujan@gmail.com",
                name="Sujan",
                id_number="1111111111111",
                phone_number="60222222223",
                onboarding_session_id=uuid.UUID("9aeaa4ec-ea42-4c64-b039-e81aff6207e0"),
            ),
            User(
                email="Namit@gmail.com",
                name="Jhon",
                id_number="1111111111111",
                phone_number="60222222224",
                onboarding_session_id=uuid.UUID("fd8f47e8-b044-4294-bf30-814df61a24eb"),
            ),
            User(
                email="Asutosh@gmail.com",
                name="Jhon",
                security_phrase="My name is Jhon Doe.",
                passcode="13215456",
                id_number="1111111111111",
                phone_number="60222222225",
                is_active=True,
                onboarding_session_id=uuid.UUID("40bd7bce-4b8b-434b-b2e5-e3a0d4daf927"),
            ),
            User(
                email="Abhishek@gmail.com",
                name="Jhon",
                security_phrase="My name is Jhon Doe.",
                passcode="13215456",
                id_number="1111111111111",
                phone_number="60222222226",
                is_active=True,
                onboarding_session_id=uuid.UUID("7b3723a0-a4e2-4277-a64e-93a63c5e8b0b"),
            ),
            User(
                email="Sachin@gmail.com",
                name="Jhon",
                security_phrase="My name is Jhon Doe.",
                passcode="13215456",
                id_number="1111111111111",
                is_locked=True,
                phone_number="60222222227",
                onboarding_session_id=uuid.UUID("7b3723a0-a4e2-4277-a64e-93a63c5e8b0c"),
            ),
            User(
                email="testuser@gmail.com",
                name="Abhishek",
                security_phrase="My name is Abhishek.",
                id_number="1111111111111",
                is_active=False,
                is_locked=False,
                phone_number="60222222228",
                onboarding_session_id=uuid.UUID("42fd2664-39a3-4396-b1cd-ff7d16d8279d"),
            ),
            User(
                email="testuser001@gmail.com",
                name="Random",
                security_phrase="My name is Random",
                id_number="1111111111111",
                is_active=True,
                is_locked=False,
                phone_number="60222222329",
                onboarding_session_id=uuid.UUID("e049f40c-f9d7-47ae-bcad-ab97dcd45f1f"),
            ),
            User(
                email="RohanBro@gmail.com",
                name="Jhon",
                security_phrase="My name is not xtranpholist.",
                passcode="13215456",
                id_number="1111111111111",
                is_active=True,
                phone_number="60222222229",
                onboarding_session_id=uuid.UUID("8dfbcf4f-4462-4b23-9538-304077f7d657"),
            ),
            User(
                id=uuid.UUID("9c7a442c-18b2-4d13-8166-908e9ac10b55"),
                email="Dipeshdai@gmail.com",
                name="Jhon",
                security_phrase="My name is xtranpholist.",
                passcode="13215456",
                id_number="1111111111111",
                is_active=True,
                current_device_id="123444444444",
                device_ids=["123444444444"],
                phone_number="60222222230",
                onboarding_session_id=uuid.UUID("d87b55ef-858a-48e8-955a-fd96dc534001"),
            ),
            User(
                email="Goku@gmail.com",
                name="Goku",
                security_phrase="My name is SS.",
                passcode="13215456",
                id_number="1111111111111",
                is_active=True,
                phone_number="60222100000",
                current_device_id="123444454444",
                device_ids=["123444454444"],
                onboarding_session_id=uuid.UUID("a79c1543-b0e1-4a69-993d-ed81a63f578e"),
            ),
            User(
                email="Vegeta@gmail.com",
                name="Vegeta",
                security_phrase="My name is Prince.",
                passcode="13215456",
                id_number="1111111111111",
                is_active=True,
                phone_number="60222100001",
                current_device_id="123556677",
                device_ids=["123556677"],
                onboarding_session_id=uuid.UUID("a89c1543-b0e1-4a69-993d-ed81a63f578e"),
            ),
            User(
                email="dashdash@gmail.com",
                name="Dash",
                security_phrase="My name is Dash.",
                passcode="13215456",
                id_number="1111111111111",
                is_active=True,
                phone_number="60222227832",
                onboarding_session_id=uuid.UUID("f57f1845-c821-4947-92dd-7dc52ccf39e4"),
            ),
            User(
                email="dashdashdush@gmail.com",
                name="Fastest speedster",
                security_phrase="My name is Dash.",
                passcode="13215456",
                id_number="1111111111111",
                is_active=True,
                device_ids=["ASDFGHJKL"],
                phone_number="60332227832",
                onboarding_session_id=uuid.UUID("a14d0de2-b144-4838-93cb-32f80c38ef4f"),
            ),
            User(
                id=uuid.uuid4(),
                email="RajatDai@gmail.com",
                name="Rajat",
                security_phrase="My name is Singh is king.",
                passcode="13215456",
                id_number="1111111111111",
                is_active=True,
                current_device_id="123556677",
                device_ids=None,
                phone_number="60222222233",
                onboarding_session_id=uuid.UUID("a9f495c1-6893-4ff2-8347-e3dc5af12af6"),
            ),
            User(
                id=uuid.uuid4(),
                email="Sigdel@gmail.com",
                name="Sigdel",
                security_phrase="My name is sigdel.",
                passcode="13215456",
                id_number="1111111111111",
                is_active=True,
                phone_number="60999999989",
                onboarding_session_id=uuid.UUID("81331ed1-0f34-4f92-a8f0-ba17e07b1a18"),
            ),
            User(
                id=uuid.uuid4(),
                email="Riyaz@gmail.com",
                name="Riyaz",
                security_phrase="My name is MD Riyaz.",
                passcode="13215456",
                id_number="1111111111111",
                is_active=False,
                phone_number="60999999777",
                onboarding_session_id=uuid.UUID("ece05a22-4a1d-4613-9ddb-07c391bec43a"),
            ),
        ]
    )
    session.commit()
    session.add(
        DeviceBindingSetting(
            enable_id_number_validation=True,
            id_number_max_validations=1,
            invalid_otp_max_validations=1,
            device_bind_limit=3,
            threshold_limit=1,
            threshold_alert_email="dipesh@8squarei.com",
            mobile_number_bind_limit=4,
        )
    )
    session.commit()
    session.add_all(
        [
            OnboardingSession(
                id=uuid.UUID("ece05a22-4a1d-4613-9ddb-07c391bec43a"),
                phone_number="60999999777",
                id_number="991100123456",
                email="Riyaz@gmail.com",
                status="Topup Name Mismatch",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("81331ed1-0f34-4f92-a8f0-ba17e07b1a18"),
                phone_number="60999999989",
                id_number="991100123456",
                email="Sigdel@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("a9f495c1-6893-4ff2-8347-e3dc5af12af6"),
                phone_number="60222222233",
                id_number="991100123456",
                email="SinghisKing@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("a89c1543-b0e1-4a69-993d-ed81a63f578e"),
                phone_number="60222100001",
                id_number="991100123456",
                email="Vegeta@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("a79c1543-b0e1-4a69-993d-ed81a63f578e"),
                phone_number="60222100000",
                id_number="991100123456",
                email="Goku@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("e8034a33-c15f-43d7-9fc0-25b72223119e"),
                phone_number="60222222222",
                id_number="991100123456",
                email="pending@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("9aeaa4ec-ea42-4c64-b039-e81aff6207e0"),
                phone_number="60222222223",
                id_number="991100123456",
                email="Sujan@gmail.com",
                indicators={"is_topup_complete": False},
            ),
            OnboardingSession(
                id=uuid.UUID("fd8f47e8-b044-4294-bf30-814df61a24eb"),
                phone_number="60222222224",
                id_number="991100123456",
                email="Namit@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("40bd7bce-4b8b-434b-b2e5-e3a0d4daf927"),
                phone_number="60222222225",
                id_number="991100123456",
                email="Asutosh@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("7b3723a0-a4e2-4277-a64e-93a63c5e8b0b"),
                phone_number="60222222226",
                id_number="991100123456",
                email="Abhishek@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("42fd2664-39a3-4396-b1cd-ff7d16d8279d"),
                phone_number="60222222228",
                id_number="991100123456",
                email="testuser@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("e049f40c-f9d7-47ae-bcad-ab97dcd45f1f"),
                phone_number="60222222329",
                id_number="991100123456",
                email="testuser001@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("8dfbcf4f-4462-4b23-9538-304077f7d657"),
                phone_number="60222222229",
                id_number="991100123456",
                email="Abhishek@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("d87b55ef-858a-48e8-955a-fd96dc534001"),
                phone_number="60222222230",
                id_number="991100123456",
                email="Abhishek@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("6d6076d5-d54a-49d8-b018-f5b8e3da822a"),
                phone_number="60222222231",
                id_number="991100123456",
                email="Abhishek@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("f57f1845-c821-4947-92dd-7dc52ccf39e4"),
                phone_number="60222227832",
                id_number="991100123456",
                email="dashdash@gmail.com",
                indicators={"is_topup_complete": True},
            ),
            OnboardingSession(
                id=uuid.UUID("a14d0de2-b144-4838-93cb-32f80c38ef4f"),
                phone_number="60332227832",
                id_number="991100123456",
                email="dashdashdush@gmail.com",
                indicators={"is_topup_complete": True},
            ),
        ]
    )
    session.commit()
    session.add_all(
        [
            Device(
                id=1000,
                device_id="123444444444",
                user_ids=[
                    uuid.UUID("9c7a442c-18b2-4d13-8166-908e9ac10b55"),
                    uuid.uuid4(),
                    uuid.uuid4(),
                ],
            ),
            Device(id=1111, device_id="IPHONEXXXXXXS", user_ids=[uuid.uuid4()]),
        ]
    )
    session.commit()


@pytest.fixture(scope="module")
def main_client(pg_session_maker):
    client = get_client(pg_session_maker, session_setup, app=main.app)
    with client as test_client:
        yield test_client
    if hasattr(client.app.state, "session") and client.app.state.session:
        client.app.state.session.close()


class TestUserLoginViewSet:
    # TODO test_create_update_device_token

    def test_login_invalid_user(self, main_client: TestClient):
        response = main_client.post(
            "user/login/",
            headers={"device-id": "456ASfsdf789"},
            json={"phone_number": "601111456785"},
        )
        assert response.status_code == 400
