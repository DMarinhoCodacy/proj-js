require 'ostruct'
require 'purchase_flow_document'
require 'spec_database'

require 'ext_services/search/event'
require 'mailers/braze/purchase/review_needed'

describe Mailers::Braze::Purchase::ReviewNeeded do
  subject { described_class.new(GtDatabase::DB::PFLOW_ID.to_s) }

  let(:purchase_flow) do
    OpenStruct.new(
      'parse' => {
        'user' => {
          '_id' => GtDatabase::DB::CUSTOMER_USER_ID
        }
      },
      'event_id' => GtDatabase::DB::EVENT_ID
    )
  end
  let(:user)       { OpenStruct.new }
  let(:full_event) { OpenStruct.new }

  before do
    allow(PurchaseFlowDocument).to receive(:new).with(GtDatabase::DB::PFLOW_ID).and_return(purchase_flow)
    allow(Utils::CustomerUser).to receive(:find_by_id).with(GtDatabase::DB::CUSTOMER_USER_ID).and_return(user)
    allow(Search::FullEvent).to receive(:find_by_id).with(GtDatabase::DB::EVENT_ID.to_s).and_return(full_event)
    allow(full_event).to receive(:sanitized_name).and_return('Coachella')
    allow(full_event).to receive(:parsed_event_date).with('%b %d, %Y').and_return('1/1/2023')
  end

  describe '#recipients' do
    it 'returns the recipients for braze' do
      recipients = [
        {
          'external_user_id' => GtDatabase::DB::CUSTOMER_USER_ID.to_s,
          'attributes' => { 'email' => 'test@gmail.com' },
          'trigger_properties' => {},
          'send_to_existing_only' => false
        }
      ]

      allow(user).to receive(:id).and_return(GtDatabase::DB::CUSTOMER_USER_ID)
      allow(user).to receive(:email).and_return('test@gmail.com')
      allow(subject).to receive(:trigger_properties).and_return({})
      expect(subject.send(:recipients)).to eq(recipients)
    end
  end

  describe '#trigger_properties' do
    it 'returns the trigger properties for braze' do
      expect(subject).to receive(:subject).and_return('SOME SUBJECT')
      expect(subject.send(:trigger_properties)).to eq({ 'SUBJECT' => 'SOME SUBJECT' })
    end
  end

  describe '#subject' do
    it 'returns the subject for the braze email' do
      expected = 'Important Action Needed - Coachella on 1/1/2023'
      expect(subject.send(:subject)).to eq(expected)
    end
  end
end