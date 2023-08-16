import uuid
from decimal import Decimal
from unittest import mock
 

from uuid import UUID

import pytest
from unittest.mock import MagicMock

from fastapi import HTTPException

from adapters.cardworks import Cardworks
 
 
 
from adapters.cardworks.cardworks.schemas import FundTransferSchema, BalanceEnquirySchema
from adapters.cardworks.cardworks.utils.validators import BuyTransactionValidator, SellTransactionValidator, \
    TransactionValidator
from apps.multi_currency.models import ApprovedMultiCurrency, MultiCurrencyTransaction
from apps.setup.models import Country, Currency
from apps.user.schemas.mobile import BuyCurrencySchema, SellCurrencySchema
from tests.apps.test_add_initial_data import AddInitialData

from core import main
from tests.utils import get_client


def session_setup(session):
    from core.db import Base

    Base.metadata.create_all(bind=session.bind)


@pytest.fixture(scope="function")
def client(pg_session_maker):
    test_client = get_client(pg_session_maker, session_setup, app=main.app)
    with test_client as tst_client:
        yield tst_client
    if hasattr(test_client.app.state, "session") and test_client.app.state.session:
        test_client.app.state.session.close()


@pytest.fixture(scope='module')
def initial_data(pgs):
    AddInitialData.test_add_needed_data(pgs)
    country = pgs.query(Country).first()
    sgd = Currency(
        name="Singapore Dollar",
        code="SGD",
        unit=1,
        numeric_code=702,
        flag_code="SG",
        order=1,
        is_active=True,
        country_id=country.id,
        currency_symbol='$',
    )
    myr = Currency(
        name="Malaysian Ringgit",
        code="MYR",
        unit=1,
        numeric_code=458,
        flag_code="MY",
        order=2,
        is_active=True,
        country_id=country.id,
        currency_symbol='$',
    )
    pgs.add(sgd)
    pgs.add(myr)
    pgs.commit()
    approved_sgd = ApprovedMultiCurrency(
        currency_id=sgd.id,
        buy_rate=12,
        sell_rate=12,
        visa_rate=12,
        created_by='user-uuid'
    )
    pgs.add(approved_sgd)
    pgs.commit()


class TestBuyTransactionValidator:

    def test_buy_transaction_creation(self, pgs, initial_data):
        mock_user = MagicMock()
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 1.00,
            "amount": 1.00
        }

        validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
 
 
 
        assert validator.transaction is None
 
 
 
        assert validator.user == mock_user
 
 
 
        assert validator.data == BuyCurrencySchema(**data)
 
 
 
        assert validator.db == pgs
 
 
 
        assert validator.base_currency.numeric_code == BuyTransactionValidator.BASE_CURRENCY_CODE
 
 
 
        assert validator.exchange_currency_code == data["beneficiary_currency_id"]
 
 
 
        assert isinstance(validator.reference_number, str) and validator.reference_number.startswith("EP")

    def test_get_cw_fund_transfer_schema(self, pgs, initial_data):
        mock_user_card = MagicMock(urn="12345", expiry_date="072025")
        mock_user = MagicMock(user_card=mock_user_card)

        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 12.00,
            "amount": 1.00
        }

        validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        fund_transfer_schema = validator.get_cw_fund_tranfer_schema()

 
 
 
        assert isinstance(fund_transfer_schema, FundTransferSchema)
 
 
 
        assert fund_transfer_schema.tranf_p_a_n == "12345"
 
 
 
        assert fund_transfer_schema.expiry_date == "072025"
 
 
 
        assert fund_transfer_schema.benef_p_a_n == "12345"
 
 
 
        assert fund_transfer_schema.reference_no.startswith("EP")
 
 
 
        assert float(fund_transfer_schema.amount) == data["total_amount"]
 
 
 
        assert fund_transfer_schema.tranf_currency_code == "458"
 
 
 
        assert fund_transfer_schema.benef_currency_code == "702"
 
 
 
        assert float(fund_transfer_schema.benef_amount) == 1.00
 
 
 
        assert fund_transfer_schema.otp_reference_no == ""
 
 
 
        assert fund_transfer_schema.otp == ""
 
 
 
        assert fund_transfer_schema.signed_message == ""
 
 
 
        assert fund_transfer_schema.conv_rate_ind == "1"

    def test_get_cw(self, pgs):
        mock_user = MagicMock()
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 12.00,
            "amount": 1.00
        }

        validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        result = validator._get_cw()
 
 
 
        assert isinstance(result, Cardworks)

    def test_get_exchange_currency(self, pgs, initial_data):
        mock_user = MagicMock()
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 12.00,
            "amount": 1.00
        }

 
 
        with pytest.raises(ValueError) as exc_info:
            validator = TransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
            validator._TransactionValidator__get_exchange_currency()

    def test_validate(self, pgs, initial_data):
        mock_user = MagicMock()
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 12.00,
            "amount": 1.00
        }
        validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        validator.validate_rate = MagicMock(return_value=True)
        validator.validate_reason = MagicMock(return_value=True)
        validator.validate_total_amount = MagicMock(return_value=True)
        validator.validate_sufficient_amount = MagicMock(return_value=True)

 
 
 
        assert validator.validate() == True

    def test_validate_rate(self, pgs, initial_data):
        mock_user = MagicMock()
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 1.00,
            "amount": 1.00
        }

        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
 
 
 
        assert buy_validator.validate_rate() == True

        data['local_rate'] = 1.00
        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        with pytest.raises(HTTPException):
            buy_validator.validate_rate()

    def test_validate_reason(self, pgs, initial_data):
        mock_user = MagicMock()
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 1.00,
            "amount": 1.00
        }

        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
 
 
 
        assert buy_validator.validate_reason() == True

        data['amount'] = 3500
        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)

        with pytest.raises(HTTPException):
 
 
 
            assert buy_validator.validate_reason()

        data['reason'] = 'Bill Utility'
        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        assert buy_validator.validate_reason() == True

    def test_validate_amount(self, pgs, initial_data):
        mock_user = MagicMock()
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 24.00,
            "amount": 2.00
        }

        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
 
 
 
        assert buy_validator.validate_total_amount() == True

        data['total_amount'] = 25.00
        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        with pytest.raises(HTTPException):
            buy_validator.validate_total_amount()

    def test_validate_sufficient_amount(self, pgs, initial_data):
        mock_user = MagicMock()
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 24.00,
            "amount": 2.00
        }

        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        # buy_validator.__user_balance = MagicMock(return_value=50)
        with mock.patch.object(BuyTransactionValidator, '_BuyTransactionValidator__user_balance',
                               return_value=50):
 
 
 
            assert buy_validator.validate_sufficient_amount() == True

        with mock.patch.object(BuyTransactionValidator, '_BuyTransactionValidator__user_balance',
                               return_value=20):
            with pytest.raises(HTTPException):
                buy_validator.validate_sufficient_amount()

    def test_create_transaction(self, pgs, initial_data):
        mock_user = MagicMock(id=uuid.uuid1())
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 24.00,
            "amount": 2.00,
            "reason": "Utility Bill"
        }

        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        buy_validator.create_transaction()
 
 
 
        assert len(pgs.query(MultiCurrencyTransaction).all()) == 1

    def test_update_status(self, pgs, initial_data):
        mock_user = MagicMock(id=uuid.uuid1())
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 24.00,
            "amount": 2.00,
            "reason": "Utility Bill"
        }

        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        transaction = buy_validator.create_transaction()
        buy_validator.update_status('Success')
        pgs.refresh(transaction)
 
 
 
        assert transaction.status == 'Success'

    def test_get_tranferior_code(self, pgs, initial_data):
        mock_user = MagicMock(id=uuid.uuid1())
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 24.00,
            "amount": 2.00,
            "reason": "Utility Bill"
        }
        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        result = buy_validator._get_tranferior_code()
 
 
 
        assert result == buy_validator.base_currency.numeric_code

    def test_get_beniferior_code(self, pgs, initial_data):
        mock_user = MagicMock(id=uuid.uuid1())
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 24.00,
            "amount": 2.00,
            "reason": "Utility Bill"
        }
        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        result = buy_validator._get_beniferior_code()
 
 
 
        assert result == buy_validator.exchange_currency.currency.numeric_code

    def test_get_total_amount(self, pgs, initial_data):
        mock_user = MagicMock(id=uuid.uuid1())
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 24.00,
            "amount": 2.00,
            "reason": "Utility Bill"
        }
        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        result = buy_validator._get_total_amount()
 
 
 
        assert result == data["total_amount"]

    def test_get_transferior_total_amount(self, pgs, initial_data):
        mock_user = MagicMock(id=uuid.uuid1())
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 24.00,
            "amount": 2.00,
            "reason": "Utility Bill"
        }
        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        result = buy_validator._get_transferior_total_amount()
        assert result == data["total_amount"]

    def test_get_beniferior_total_amount(self, pgs, initial_data):
        mock_user = MagicMock(id=uuid.uuid1())
        data = {
            "beneficiary_currency_id": 702,
            "local_rate": 12.00,
            "total_amount": 24.00,
            "amount": 2.00,
            "reason": "Utility Bill"
        }
        buy_validator = BuyTransactionValidator(mock_user, BuyCurrencySchema(**data), pgs)
        result = buy_validator._get_beniferior_total_amount()
 
 
 
        assert result == data["amount"]


def sell_data():
    data = {
        "transferor_currency_code": 702.00,
        "amount": 30.00,
        "reason": "Utility Bill"
    }
    return data


class TestSellTransactionValidator:
    def test_sell_transaction_creation(self, pgs, initial_data):
        mock_user = MagicMock()
        data = {
            "transferor_currency_code": 702.00,
            "amount": 30.00
        }

        validator = SellTransactionValidator(mock_user, SellCurrencySchema(**data), pgs)
        assert validator.transaction is None
        assert validator.user == mock_user
 
 
 
        assert validator.data == SellCurrencySchema(**data)
        assert validator.db == pgs
 
 
 
        assert validator.base_currency.numeric_code == SellTransactionValidator.BASE_CURRENCY_CODE
 
 
 
        assert validator.exchange_currency_code == data["transferor_currency_code"]
        assert isinstance(validator.reference_number, str) and validator.reference_number.startswith("EP")

    def test_get_cw_fund_transfer_schema(self, pgs, initial_data):
        # Mocking user and user_card objects
        mock_user_card = MagicMock(urn="12345", expiry_date="072025")
        mock_user = MagicMock(user_card=mock_user_card)

        # Create a mock data dictionary
        data = {
            "transferor_currency_code": 702.00,
            "amount": 30.00
        }

        # Create the TransactionValidator object and call the method to get the FundTransferSchema
        validator = SellTransactionValidator(mock_user, SellCurrencySchema(**data), pgs)
        fund_transfer_schema = validator.get_cw_fund_tranfer_schema()

        # Check if the FundTransferSchema object is created with the expected values
        assert isinstance(fund_transfer_schema, FundTransferSchema)
        assert fund_transfer_schema.tranf_p_a_n == "12345"
        assert fund_transfer_schema.expiry_date == "072025"
        assert fund_transfer_schema.benef_p_a_n == "12345"
        assert fund_transfer_schema.reference_no.startswith("EP")
 
 
 
        assert float(fund_transfer_schema.amount) == data["amount"]
 
 
 
        assert fund_transfer_schema.tranf_currency_code == "702"
 
 
 
        assert fund_transfer_schema.benef_currency_code == "458"
 
 
 
        assert float(fund_transfer_schema.benef_amount) == data["amount"] * validator.exchange_currency.buy_rate
        assert fund_transfer_schema.otp_reference_no == ""
        assert fund_transfer_schema.otp == ""
        assert fund_transfer_schema.signed_message == ""
        assert fund_transfer_schema.conv_rate_ind == "1"

    def test_validate_balance(self, pgs, initial_data):
        mock_user = MagicMock()
        data = {
            "transferor_currency_code": 702.00,
            "amount": 30.00
        }

        sell_validator = SellTransactionValidator(mock_user, SellCurrencySchema(**data), pgs)

        with mock.patch.object(SellTransactionValidator, '_SellTransactionValidator__get_total_balance',
                               return_value=50):
 
 
 
            assert sell_validator.validate_balance() == True

        with mock.patch.object(SellTransactionValidator, '_SellTransactionValidator__get_total_balance',
                               return_value=20):
            with pytest.raises(HTTPException):
                sell_validator.validate_balance()

    def test_create_transaction(self, pgs, initial_data):
        mock_user = MagicMock(id=uuid.uuid1())
        data = sell_data()

        sell_validator = SellTransactionValidator(mock_user, SellCurrencySchema(**data), pgs)
        sell_validator.create_transaction()
 
 
 
        assert len(pgs.query(MultiCurrencyTransaction).filter_by(customer_id=mock_user.id).all()) == 1

    def test_update_status(self, pgs, initial_data):
        mock_user = MagicMock(id=uuid.uuid1())
        data = sell_data()

        sell_validator = SellTransactionValidator(mock_user, SellCurrencySchema(**data), pgs)
        transaction = sell_validator.create_transaction()
        sell_validator.update_status('Failed')
        pgs.refresh(transaction)
 
 
 
        assert transaction.status == 'Failed'

    def test_validate(self, pgs, initial_data):
        validator = self.get_sell_validator(pgs)
        validator.validate_balance = MagicMock(return_value=True)
        validator.validate_reason = MagicMock(return_value=True)

        assert validator.validate() == True

    def get_sell_validator(self, pgs):
        mock_user = MagicMock()
        data = sell_data()
        validator = SellTransactionValidator(mock_user, SellCurrencySchema(**data), pgs)
        return validator

    def test_get_cw(self, pgs):
        validator = self.get_sell_validator(pgs)
        result = validator._get_cw()

        assert isinstance(result, Cardworks)

    def test_get_tranferior_code(self, pgs, initial_data):
        validator = self.get_sell_validator(pgs)
        result = validator._get_tranferior_code()
 
 
 
        assert result == validator.exchange_currency.currency.numeric_code

    def test_get_beniferior_code(self, pgs, initial_data):
        validator = self.get_sell_validator(pgs)
        result = validator._get_beniferior_code()
 
 
 
        assert result == validator.base_currency.numeric_code

    def test_get_transferior_total_amount(self, pgs, initial_data):
        validator = self.get_sell_validator(pgs)
        result = validator._get_transferior_total_amount()
        data = sell_data()
 
 
 
        assert result == Decimal(data["amount"])

    def test_get_beniferior_total_amount(self, pgs, initial_data):
        validator = self.get_sell_validator(pgs)
        result = validator._get_beniferior_total_amount()
        data = sell_data()
 
 
 
        assert result == Decimal(data["amount"] * validator.exchange_currency.buy_rate)

    def test_validate_reason(self, pgs, initial_data):
        mock_user = MagicMock()
        data = {
            "transferor_currency_code": 702.00,
            "amount": 30.00
        }

        sell_validator = SellTransactionValidator(mock_user, SellCurrencySchema(**data), pgs)
 
 
 
        assert sell_validator.validate_reason() == True

        data['amount'] = 3500
        sell_validator = SellTransactionValidator(mock_user, SellCurrencySchema(**data), pgs)

        with pytest.raises(HTTPException):
 
 
 
            assert sell_validator.validate_reason()

        data['reason'] = 'Bill Utility'
        sell_validator = SellTransactionValidator(mock_user, SellCurrencySchema(**data), pgs)
        assert sell_validator.validate_reason() == True