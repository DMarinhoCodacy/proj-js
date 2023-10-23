require 'ostruct'
require 'spec_database'

require 'utils'
require 'mailers/braze/user/account_locked'

describe Mailers::Braze::User::AccountLocked do
  subject { described_class.new(GtDatabase::DB::CUSTOMER_USER_ID, 'server_token') }

  let(:user_id) { 'USER_ID'.freeze }
  let(:user)    { OpenStruct.new }
  let(:branch)  { OpenStruct.new }

  before do
    allow(Utils::CustomerUser).to receive(:find_by_id).with(GtDatabase::DB::CUSTOMER_USER_ID).and_return(user)
    allow(ExtServices::Branch::Client).to receive(:new).and_return(branch)
    allow(branch).to receive(:get_link)
  end

  describe '#initialize' do
    it 'initializes pertinent instance variables' do
      expect(subject.instance_variable_get(:@server_token)).to eq('server_token')
    end
  end

  describe '#deliver?' do
    it 'returns false when user does not have a password' do
      trigger_properties = {}
      recipients = [
        {
          'external_user_id' => user_id,
          'attributes' => { 'email' => 'testing@test.com' },
          'trigger_properties' => trigger_properties,
          'send_to_existing_only' => false
        }
      ]

      allow(user).to receive(:id).and_return(user_id)
      allow(user).to receive(:email).and_return('testing@test.com')
      expect(subject).to receive(:trigger_properties).and_return(trigger_properties)
      expect(subject.send(:recipients)).to eq(recipients)

      allow(user).to receive(:password_enabled?).and_return(false)
      expect(subject.send(:deliver?)).to eq(false)
    end

    it 'returns true when user has a password' do
      trigger_properties = {}
      recipients = [
        {
          'external_user_id' => user_id,
          'attributes' => { 'email' => 'testing@test.com' },
          'trigger_properties' => trigger_properties,
          'send_to_existing_only' => false
        }
      ]

      allow(user).to receive(:id).and_return(user_id)
      allow(user).to receive(:email).and_return('testing@test.com')
      expect(subject).to receive(:trigger_properties).and_return(trigger_properties)
      expect(subject.send(:recipients)).to eq(recipients)

      allow(user).to receive(:password_enabled?).and_return(true)
      expect(subject.send(:deliver?)).to eq(true)
    end
  end

  describe '#recipients' do
    it 'provides recipients for braze' do
      trigger_properties = {}
      recipients = [
        {
          'external_user_id' => user_id,
          'attributes' => { 'email' => 'testing@test.com' },
          'trigger_properties' => trigger_properties,
          'send_to_existing_only' => false
        }
      ]

      allow(user).to receive(:id).and_return(user_id)
      allow(user).to receive(:email).and_return('testing@test.com')
      expect(subject).to receive(:trigger_properties).and_return(trigger_properties)
      expect(subject.send(:recipients)).to eq(recipients)
    end
  end

  describe '#trigger_properties' do
    it 'provides trigger properties for braze' do
      expect(subject).to receive(:deeplink).and_return('deeplink')
      expect(subject.send(:trigger_properties)).to eq('DEEPLINK' => 'deeplink')
    end
  end

  describe '#path' do
    it 'provides path for deeplink' do
      expect(subject.send(:path)).to eq('/dl/magic_login?token=server_token')
    end
  end

  describe 'deeplink' do
    it 'provides deeplink from branch link if available' do
      allow(branch).to receive(:get_link).with('/dl/magic_login?token=server_token').and_return('some_branch_link')
      subject.instance_variable_set(:@branch, branch)
      expect(subject.send(:deeplink)).to eq('some_branch_link')
    end

    it 'provides homepage url if branch link is not available' do
      allow(branch).to receive(:get_link).with('/dl/magic_login?token=server_token').and_return(nil)
      allow(GtSettings).to receive(:homepage_url).and_return('https://gametime.co')
      expect(subject.send(:deeplink)).to eq('https://gametime.co/dl/magic_login?token=server_token')
      teste
    end
  end
end