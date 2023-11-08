/**
 * The controller class for the pickup module
 * @author    Shruti Kamath (shruKamath@deloitte.nl)
 * @created   Nov 2020
 */


 public with sharing class PNL_PickupController {

    private static final String ORDER_INITIAL = '5000';

    static {
        App_AuraSecurityService.newInstance().verifyClassAccess(PNL_PickupController.class);
    }

    /**
    * Get the collection and delivery address information from service contracts and orders.
    *
    * @param request Request parameters
    *
    * @return pickup addresses for the customer number.
    */
    @AuraEnabled
    public static DBO_LCResponse getPickupAddresses(SAS_PickupDeliveryAddressReadService.Request request) {
        App.verifyNotNull('request', request);

        DBO_LCResponse response;
        try {
            SAS_PickupDeliveryAddressReadService.Response readResponse = (SAS_PickupDeliveryAddressReadService.Response)
                    SAS_PickupDeliveryAddressReadService.newInstance().readAddresses(request);

            if(readResponse.success) {
                List<SAS_PickupDeliveryAddressReadService.PickupAddress> pickupAddresses = readResponse.addresses;
                if (!readResponse.hasContract){
                    pickupAddresses.add(new SAS_PickupDeliveryAddressReadService.PickupAddress('noContract'));
                }
                response = new DBO_LCResponse(pickupAddresses);
            } else {
                response = new DBO_LCResponse().asFail();
            }

        } catch (Exception ex) {
            App_Logger.newInstance().logError(ex);
            response = new DBO_LCResponse().asFail();
        }

        return response;
    }

    /**
     * Get the collection and delivery schedule information from service contracts and orders.
     * @param request Request parameters.
     * @return pickup schedule for the customer number.
     */
    @AuraEnabled

    public static DBO_LCResponse getScheduledPickupsForToday(SAS_PickupDeliveryAppointmentReadService.Request request) {
        App.verifyNotNull('request', request);
        DBO_LCResponse response;
        try {
            SAS_PickupDeliveryAppointmentReadService.Response readResponse = (SAS_PickupDeliveryAppointmentReadService.Response)
                    SAS_PickupDeliveryAppointmentReadService.newInstance().readAppointments(request);
                response = new DBO_LCResponse(readResponse);
        } catch(Exception ex) {
            App_Logger.newInstance().logError(ex);
            response = new DBO_LCResponse().asFail();
        }

        return response;
    }

    /**
    * Get the collection and delivery schedule information from service contracts and orders by weekdays.
    * @param request Request parameters.
    * @return pickup schedule by weekdays for the customer number.
    */
    @AuraEnabled

    public static DBO_LCResponse getScheduledAgendaByWeek(SAS_PickupDeliveryAgendaReadService.Request request) {
        App.verifyNotNull('request', request);
        DBO_LCResponse response;
        try {
            SAS_PickupDeliveryAgendaReadService.Response readResponse = (SAS_PickupDeliveryAgendaReadService.Response)
                    SAS_PickupDeliveryAgendaReadService.newInstance().readAgenda(request);
            response = new DBO_LCResponse(readResponse);
        } catch (Exception ex) {
            App_Logger.newInstance().logError(ex);
            response = new DBO_LCResponse().asFail();
        }

        return response;
    }

    /**
     * Get the collection and delivery schedule information from service contracts and orders for status overview.
     * @param request Request parameters.
     * @return pickup schedule by weekdays for the customer number.
     */
    @AuraEnabled

    public static DBO_LCResponse getScheduledPickupsStatus(SAS_PickupDeliveryReadService.Request request) {
        App.verifyNotNull('request', request);
        DBO_LCResponse response;
        try {
            SAS_PickupDeliveryReadService.Response readResponse = (SAS_PickupDeliveryReadService.Response)
                    SAS_PickupDeliveryReadService.newInstance().readServiceContractsAndOrders(request);
            response = new DBO_LCResponse(readResponse);
        } catch (Exception ex) {
            App_Logger.newInstance().logError(ex);
            response = new DBO_LCResponse().asFail();
        }

        return response;
    }

    /**
     * Get the collection and delivery schedule deatil information from service contracts and orders.
     * @param request Request parameters.
     * @return pickup schedule details for the customer number.
     */
    @AuraEnabled

    public static DBO_LCResponse getPickupDetails(SAS_PickupDeliveryApptDetailService.Request request) {
        App.verifyNotNull('request', request);
        DBO_LCResponse response;
        try {
            SAS_PickupDeliveryApptDetailService.Response readResponse = (SAS_PickupDeliveryApptDetailService.Response)
                    SAS_PickupDeliveryApptDetailService.newInstance().readServiceContractsAndOrdersDetails(request);
            response = new DBO_LCResponse(readResponse);
        } catch (Exception ex) {
            App_Logger.newInstance().logError(ex);
            response = new DBO_LCResponse().asFail();
        }

        return response;
    }

    /**
     * Get the collection and delivery setup details needed for creating an incidental order.
     * @param request Request parameters.
     * @return miscellaneous details needed during creating an order - individual address fields, order setup details
     */
    @AuraEnabled

    public static DBO_LCResponse getSetupDetails(SAS_PickupDeliverySetupDetailsService.Request request) {

        App.verifyNotNull('request', request);
        DBO_LCResponse response;
        try {
            SAS_PickupDeliverySetupDetailsService.Response readResponse = (SAS_PickupDeliverySetupDetailsService.Response)
                    SAS_PickupDeliverySetupDetailsService.newInstance().readSetupDetails(request);
            response = new DBO_LCResponse(readResponse);
        } catch (Exception ex) {
            App_Logger.newInstance().logError(ex);
            response = new DBO_LCResponse().asFail();
        }

        return response;
    }

    /**
     * Get the collection and delivery setup details needed for creating an incidental order.
     * @param request Request parameters.
     * @return miscellaneous details needed during creating an order - individual address fields, order setup details
     */
    @AuraEnabled

    public static DBO_LCResponse createOrder(SAS_PickupDeliveryCreateOrderService.Request request) {
        App.verifyNotNull('request', request);
        DBO_LCResponse response;
        try {
            SAS_PickupDeliveryCreateOrderService.Response createOrderResponse = (SAS_PickupDeliveryCreateOrderService.Response)
                    SAS_PickupDeliveryCreateOrderService.newInstance().createOrders(request);
            response = new DBO_LCResponse(createOrderResponse);

        } catch (Exception ex) {
            App_Logger.newInstance().logError(ex);
            response = new DBO_LCResponse().asFail();
        }

        return response;
    }

    /**
     * Get the collection and delivery appointment details needed for cancellation or suspension
     * @param req Request parameters.
     * @return reposne of success of failure
     */
    @AuraEnabled

    public static DBO_LCResponse processCancellation( Request req ) {
        SAS_TemporarySuspensionCreateService.Request reqForSC = new  SAS_TemporarySuspensionCreateService.Request();
        reqForSC.timetableInfoList = new List<SAS_TemporarySuspensionCreateService.TimeTable>();

        SAS_PickupDeliveryCancelOrderService.Request reqForOrderCancellation = new SAS_PickupDeliveryCancelOrderService.Request();
        reqForOrderCancellation.orders = new List<SAS_PickupDeliveryCancelOrderService.OrderRequest>();

        for( TimeTable tt : req.appointmentsToCancel ) {
            if( tt.recordNumber.startsWith( ORDER_INITIAL ) ) {
                SAS_PickupDeliveryCancelOrderService.OrderRequest OrderRequest = new SAS_PickupDeliveryCancelOrderService.OrderRequest();
                OrderRequest.orderNumber    = tt.recordNumber;
                OrderRequest.cancelChannel  = tt.channel;
                OrderRequest.cancelParty    = tt.party;
                reqForOrderCancellation.orders.add(OrderRequest);
            } else {
                SAS_TemporarySuspensionCreateService.TimeTable timeTable = new  SAS_TemporarySuspensionCreateService.TimeTable();
                timeTable.serviceContractNumber = tt.recordNumber;
                timeTable.startDate             = tt.startDate;
                timeTable.endDate               = tt.endDate;
                timeTable.cancelChannel         = tt.channel;
                timeTable.cancelParty           = tt.party;
                reqForSC.timetableInfoList.add(timeTable);
            }
        }

        DBO_LCResponse response;
        try {
            // Create Suspension
            if(!reqForSC.timetableInfoList.isEmpty()) {
                SAS_TemporarySuspensionCreateService.Response createSuspension = (SAS_TemporarySuspensionCreateService.Response)
                        SAS_TemporarySuspensionCreateService.newInstance().createTemporarySuspensions(reqForSC);
                response = new DBO_LCResponse( createSuspension );
            }

            // Cancel Orders
            if(!reqForOrderCancellation.orders.isEmpty()) {
                SAS_PickupDeliveryCancelOrderService.Response cancelOrders = (SAS_PickupDeliveryCancelOrderService.Response)
                        SAS_PickupDeliveryCancelOrderService.newInstance().cancelOrders( reqForOrderCancellation );
                response = new DBO_LCResponse(cancelOrders);
            }
        } catch (Exception e) {
            App_Logger.newInstance().logError(e);
            response = new DBO_LCResponse().asFail();
        }

        return response;
    }

    @AuraEnabled

    public static DBO_LCResponse getPrice(PNL_PickupService.Request request) {
        App.verifyNotNull('request', request);

        DBO_LCResponse response;
        fflib_ISObjectUnitOfWork uow = App_Application.unitOfWork.newInstance();

        try{
            request.priceRequest.timeFrame = DOM_Orders.TIMEFRAME_NUMBER_MAPPING.get(request.priceRequest.timeFrame);

            PNL_PickupService.PriceResponse priceResponse = PNL_PickupService.newInstance().getOrderPriceForMail(request.priceRequest, uow);

            response = new DBO_LCResponse(priceResponse.price);

            uow.commitWork();

        } catch(Exception ex){
            App_Logger.newInstance().logError(ex);
            response = new DBO_LCResponse().asFail();
        }

        return response;
    }

    /**
     * @param request structure for pickup details to be sent to hybris
     * method to get Parcel price from Hybris
     * @return DBO_LCResponse structure containing Price details
     */
    @AuraEnabled

    public static DBO_LCResponse getParcelsPrice(PNL_PickupService.Request request) {
        App.verifyNotNull('request', request);

        DBO_LCResponse response;
        fflib_ISObjectUnitOfWork uow = App_Application.unitOfWork.newInstance();

        try{

            PNL_PickupService.PriceResponse priceResponse = PNL_PickupService.newInstance().getOrderPriceForParcel(request.priceRequest, uow);

            if(priceResponse.message == Label.Success) {
                response = new DBO_LCResponse(priceResponse);
            }else{
                response = new DBO_LCResponse().asFail();
            }
            uow.commitWork();

        } catch(Exception ex){
            App_Logger.newInstance().logError(ex);
            response = new DBO_LCResponse().asFail();
        }

        return response;
    }

    public class Request{
        @AuraEnabled

        public List<TimeTable> appointmentsToCancel{get; set;}
    }
    public class TimeTable{
        @AuraEnabled
    public String recordNumber {get; set;}
        @AuraEnabled
	public String startDate {get; set;}
        @AuraEnabled
	public String endDate {get; set;}
        @AuraEnabled
    public String channel {get; set;}
        @AuraEnabled
    public String party {get; set;}
    }
}     