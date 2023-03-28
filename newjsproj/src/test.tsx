import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Colors,
  CrossAxisAlignments,
  Dialog,
  Heading,
  Icons,
  Orientations,
  PrimaryButton,
  Row,
  Spacer,
  Spacings,
  TextButton,
  useSnackbar
} from '@polestar/component-warehouse-react';
import useDatoState from '~app/hooks/useDatoState';
import useAuthState from '~app/hooks/useAuthState';
import useDateFormatter from '~app/hooks/useDateFormatter';
import useBulkOps from '~app/hooks/useBulkOps';
import {
  BookingStatusFilterType,
  calculateClashes,
  CalendarResolutionType,
  getNowSlot,
  getTimeSlots,
  Timeslot
} from '~app/helpers/calendarHelper';

import Filters from '~app/components/CalendarContainer/Filters';
import Schedule from '~app/components/CalendarContainer/Schedule';
import Calendar from '~app/components/CalendarContainer/Calendar';
import Legend from '~app/components/CalendarContainer/Legend';
import DateTimeIntervalInput, {
  DateTimeInterval
} from '~app/components/Shared/DateTimeIntervalInput';
import TextLabel from '~app/components/Shared/TextLabel';
import * as Styled from './styles';
import {
  convertFromUtc,
  prepFromDateParamInUtc,
  prepToDateParamInUtc
} from '~app/helpers/dateHelper';
import { GetLocationsResponse, GET_LOCATIONS } from '~app/apollo/queries/getLocations';
import { useQuery } from '@apollo/client';
import { HandoverFilterAttrib, HandoverFilterType } from '~app/enums/Filters';
import { HandoverStates } from '~app/enums';
import * as SharedStyle from '~app/components/Shared/styles';

type Props = {
  currentOrder?: {
    orderNumber: string;
    customerName: string;
    vin: string;
    earliestHandoverDate?: string | null;
    handoverLocation?: string | null;
    registrationNumber: string;
  };
  onHasProposalsChange?: (value: boolean) => void;
  onHandoverUpdated?: () => void;
  isConfirming?: boolean | null;
  startDate?: string | null;
};

const CalendarContainer = ({
  currentOrder,
  onHasProposalsChange,
  isConfirming,
  onHandoverUpdated,
  startDate
}: Props) => {
  const { userLocation } = useAuthState();
  const { text } = useDatoState();
  const {
    formatDateFromUtcIsoString,
    addDaysToIso,
    getFirstAndLastDayOfTheWeekConvertToUTC,
    getTodayString,
    convertToUtc
  } = useDateFormatter(userLocation.timezone);
  const { getAllHandovers } = useBulkOps();
  const { addSnackbar } = useSnackbar();
  const viewFromUrl = new URLSearchParams(window.location.search).get('view');

  const [displayFilter, setDisplayFilter] = useState<CalendarResolutionType>(
    viewFromUrl === 'DAY' ? 'DAY' : 'WORKINGWEEK'
  );
  const [timeslots, setTimeslots] = useState<ReturnType<typeof getTimeSlots>>([]);
  const [dateFilter, setDateFilter] = useState(
    displayFilter === 'DAY'
      ? [
          prepFromDateParamInUtc(new Date(startDate ?? ''), userLocation.timezone),
          prepToDateParamInUtc(new Date(startDate ?? ''), userLocation.timezone)
        ]
      : getFirstAndLastDayOfTheWeekConvertToUTC(
          startDate ??
            prepFromDateParamInUtc(new Date(startDate ?? ''), userLocation.timezone) ??
            getTodayString(),
          displayFilter === 'WORKINGWEEK' ? 5 : 7
        )
  );

  const [statusFilter, setStatusFilter] = useState<BookingStatusFilterType>('ALL');

  const [locationFilter, setLocationFilter] = useState<LocationsFilterType>('ALL');

  const [viewDays, setViewDays] = useState<Array<string>>([]);

  const [editingProposal, setEditingProposal] = useState<'first' | 'second' | 'none'>('none');
  const [date1, setDate1] = useState<DateTimeInterval | null>(null);
  const [date2, setDate2] = useState<DateTimeInterval | null>(null);

  const [fetchedSlots, setFetchedSlots] = useState<Array<Timeslot>>([]);

  const [isLoading, setIsLoading] = useState(false);

  const isCalendarPage = window.location.href.includes('calendar');

  const [proposals, setProposals] = useState<
    Array<{ ordernumber: string; start: string; end: string }>
  >([]);

  const { data: locationData, loading: isLoadingLocations } =
    useQuery<GetLocationsResponse>(GET_LOCATIONS);

  const allLocations = useMemo(
    () => locationData?.locations.map(location => ({ name: location.name, id: location.id })) ?? [],
    [locationData]
  );

  useEffect(() => {
    if (onHasProposalsChange) {
      onHasProposalsChange(proposals.length > 0);
    }
  }, [onHasProposalsChange, proposals.length]);

  const locationFilterOptions = useMemo(() => {
    let handoverLocations: Array<string> = [];
    fetchedSlots.forEach(s => {
      if (s.handoverPartner.name) handoverLocations.push(s.handoverPartner.name);
    });
    return Array.from(new Set(handoverLocations));
  }, [fetchedSlots]);

  type LocationsFilterType = (typeof locationFilterOptions)[number];

  const refresh = useCallback(
    async (clearProposals = true) => {
      if (clearProposals) {
        setProposals([]);
      }
      const getFilter = (sortKey: HandoverFilterAttrib) => {
        let dateFilterAttrib = HandoverFilterAttrib.HANDOVER_DATE;
        if (sortKey === HandoverFilterAttrib.HANDOVER_SECONDARY_DATE) {
          dateFilterAttrib = HandoverFilterAttrib.HANDOVER_SECONDARY_DATE;
        }
        return {
          searchValue: '',
          from: 0,
          size: 2000,
          sortings: { field: sortKey, isSortOrderDescending: false },
          filters: [
            {
              field: HandoverFilterAttrib.LOCATION_ID,
              type: HandoverFilterType.IS,
              values: [userLocation.id]
            },
            {
              field: HandoverFilterAttrib.HANDOVER_STATE,
              type: HandoverFilterType.IS,
              values: [
                HandoverStates.IN_TRANSIT,
                HandoverStates.PREPARATION,
                HandoverStates.DONE,
                HandoverStates.PARTIALLY_DELIVERED
              ]
            },
            {
              field: dateFilterAttrib,
              type: HandoverFilterType.GTE,
              values: [dateFilter[0]]
            },
            {
              field: dateFilterAttrib,
              type: HandoverFilterType.LTE,
              values: [dateFilter[1]]
            }
          ]
        };
      };
      setIsLoading(true);
      const [primary = [], secondary = []] = await Promise.all([
        getAllHandovers({
          input: getFilter(HandoverFilterAttrib.HANDOVER_DATE)
        }),
        getAllHandovers({
          input: getFilter(HandoverFilterAttrib.HANDOVER_SECONDARY_DATE)
        })
      ]);

      let primarySlots = getTimeSlots(primary, dateFilter[0], dateFilter[1], true, allLocations);
      let secondarySlots = getTimeSlots(
        secondary,
        dateFilter[0],
        dateFilter[1],
        false,
        allLocations
      );
      if (currentOrder?.handoverLocation) setLocationFilter(currentOrder.handoverLocation);

      const total = [...primarySlots, ...secondarySlots];
      setFetchedSlots([...total]);
      setIsLoading(false);
    },
    [userLocation.id, dateFilter, getAllHandovers, allLocations, currentOrder?.handoverLocation]
  );

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  useEffect(() => {
    let selectedSlots: ReturnType<typeof getTimeSlots> = [];
    if (currentOrder != null) {
      selectedSlots = proposals
        .map((x, index) => ({
          index: index,
          orderNumber: currentOrder.orderNumber,
          state: 'PENDING' as const,
          title: text(`Option${index + 1}`),
          start: x.start,
          end: x.end,
          timeshare: 1,
          assignedTo: '',
          customer: currentOrder.customerName,
          orderState: 'PREPARATION' as const,
          registrationNumber: currentOrder.registrationNumber,
          vin: currentOrder.vin,
          handoverPartner: { id: '', name: '' },
          handoverLocation: { city: '', address: '', zipCode: '' },
          slotType: 'pending' as const,
          startPos: 0,
          width: 0
        }))
        .filter(
          x =>
            new Date(x.start) > new Date(dateFilter[0]) &&
            new Date(x.start) < new Date(dateFilter[1])
        );
    }

    setTimeslots([
      ...calculateClashes([
        ...fetchedSlots
          .filter(x => (statusFilter === 'ALL' ? true : x.state === statusFilter))
          .filter(x =>
            locationFilter === 'ALL' ? true : x.handoverPartner.name === locationFilter
          ),
        ...selectedSlots
      ]),
      ...getNowSlot(dateFilter[0], dateFilter[1])
    ]);
  }, [currentOrder, dateFilter, fetchedSlots, locationFilter, proposals, statusFilter, text]);

  useEffect(() => {
    const weekDays = Array.from(Array(7).keys()).map(x => addDaysToIso(dateFilter[0], x));
    setViewDays([
      ...(displayFilter === 'DAY'
        ? [weekDays[0]]
        : displayFilter === 'WORKINGWEEK'
        ? weekDays.slice(0, 5)
        : weekDays)
    ]);
  }, [addDaysToIso, dateFilter, displayFilter, formatDateFromUtcIsoString]);

  const onDisplayFilterChange = useCallback(
    (newFilter: CalendarResolutionType) => {
      if (newFilter === 'DAY') {
        const filteredDay = convertToUtc(
          new Date(startDate ?? getTodayString()).toISOString().split('T')[0],
          '00:00'
        );
        setDateFilter([filteredDay, addDaysToIso(filteredDay, 1)]);
      } else {
        setDateFilter(
          getFirstAndLastDayOfTheWeekConvertToUTC(
            dateFilter[0],
            newFilter === 'WORKINGWEEK' ? 5 : 0 /* sunday */
          )
        );
      }
      setDisplayFilter(newFilter);
    },
    [
      addDaysToIso,
      convertToUtc,
      dateFilter,
      getFirstAndLastDayOfTheWeekConvertToUTC,
      getTodayString,
      startDate
    ]
  );

  const onOpenProposal = useCallback(
    (editingType: typeof editingProposal) => {
      setDate1(
        proposals.length > 0
          ? {
              isoDate: formatDateFromUtcIsoString(proposals[0].start, 'YYYY-MM-DD'),
              start: formatDateFromUtcIsoString(proposals[0].start, 'HH:mm'),
              end: formatDateFromUtcIsoString(proposals[0].end, 'HH:mm')
            }
          : null
      );
      setDate2(
        proposals.length > 1
          ? {
              isoDate: formatDateFromUtcIsoString(proposals[1].start, 'YYYY-MM-DD'),
              start: formatDateFromUtcIsoString(proposals[1].start, 'HH:mm'),
              end: formatDateFromUtcIsoString(proposals[1].end, 'HH:mm')
            }
          : null
      );
      setEditingProposal(editingType);
    },
    [formatDateFromUtcIsoString, proposals]
  );

  const addProposal = useCallback(() => {
    if (isConfirming ? proposals[0] : proposals[0] && proposals[1]) {
      addSnackbar({
        content: text('MaxTimeSlotsSelected'),
        closeOnClick: true,
        error: true
      });
    } else {
      const now = Date.now();
      const start = new Date(now + 60 * 60 * 1000);
      const end = new Date(now + 2 * 60 * 60 * 1000);
      let [startDate, startHour] = formatDateFromUtcIsoString(
        start.toISOString(),
        'YYYY-MM-DDTHH'
      ).split('T');
      let [endDate, endHour] = formatDateFromUtcIsoString(end.toISOString(), 'YYYY-MM-DDTHH').split(
        'T'
      );
      if (start < new Date(dateFilter[0])) {
        startDate = convertFromUtc(dateFilter[0], userLocation.timezone).split('T')[0];
        endDate = convertFromUtc(dateFilter[0], userLocation.timezone).split('T')[0];
        startHour = '9';
        endHour = '10';
      }
      if (currentOrder?.earliestHandoverDate) {
        const earliestHandoverDate = new Date(currentOrder?.earliestHandoverDate);
        if (new Date(startDate) < earliestHandoverDate) {
          startDate = convertFromUtc(
            earliestHandoverDate.toISOString(),
            userLocation.timezone
          ).split('T')[0];
          endDate = convertFromUtc(earliestHandoverDate.toISOString(), userLocation.timezone).split(
            'T'
          )[0];
          startHour = '9';
          endHour = '10';
        }
      }
      setProposals(prev => [
        ...prev,
        {
          ordernumber: currentOrder?.orderNumber ?? '',
          start: convertToUtc(startDate, startHour),
          end: convertToUtc(endDate, endHour)
        }
      ]);
    }
  }, [
    isConfirming,
    proposals,
    addSnackbar,
    text,
    formatDateFromUtcIsoString,
    dateFilter,
    currentOrder?.earliestHandoverDate,
    currentOrder?.orderNumber,
    userLocation.timezone,
    convertToUtc
  ]);

  // How to handle removed proposals
  // useEffect(() => {
  //   if (proposals.length > 0) {
  //     onOpenProposal(proposals.length === 1 ? 'first' : 'second');
  //   }
  // }, [onOpenProposal, proposals.length]);

  return (
    <>
      <div data-testid="calendar-container">
        {isCalendarPage && <Styled.FilterDividerTop />}
        <div style={{ marginTop: !isCalendarPage ? '-2.5rem' : '0' }}>
          <Filters
            dateFilter={dateFilter}
            onDateFilterChange={newDates => setDateFilter(newDates)}
            statusFilter={statusFilter}
            onStatusFilterChange={newStatus => setStatusFilter(newStatus)}
            viewFilter={displayFilter}
            onViewFilterChange={newView => onDisplayFilterChange(newView)}
            handoverLocations={locationFilterOptions}
            locationFilter={currentOrder ? null : locationFilter}
            onLocationFilterChange={newLocationFilter => setLocationFilter(newLocationFilter)}
          />
        </div>
        <Styled.FilterDividerBottom />
        {currentOrder ? (
          <Schedule
            proposals={proposals.sort(
              (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
            )}
            onAddProposal={addProposal}
            customerName={currentOrder.customerName}
            orderNumber={currentOrder.orderNumber}
            vin={currentOrder.vin}
            onProposalsUpdated={refresh}
            isConfirming={isConfirming}
            onHandoverUpdated={onHandoverUpdated}
          />
        ) : (
          <Legend />
        )}
        <Calendar
          timeslots={timeslots}
          proposals={proposals}
          onProposalsChange={newProposals => setProposals(newProposals)}
          onProposalClicked={index => onOpenProposal(index === 0 ? 'first' : 'second')}
          dateFilterStart={dateFilter[0]}
          view={displayFilter}
          viewDays={viewDays}
          currentOrder={currentOrder?.orderNumber}
          isConfirming={isConfirming}
          earliestHandoverDate={currentOrder?.earliestHandoverDate}
          isLoading={isLoading || isLoadingLocations}
        />
        {currentOrder && (
          <Dialog
            detached
            open={editingProposal !== 'none'}
            onClose={() => setEditingProposal('none')}
            withCloseButton
            closeButtonProps={{
              icon: Icons.close,
              pairedWithText: true
            }}
          >
            {editingProposal !== 'none' && (
              <>
                <SharedStyle.ColoredHeading level={2} color={Colors.stormGrey}>
                  {currentOrder.customerName}
                </SharedStyle.ColoredHeading>
                <Heading level={2}>{text('Vin{nbr}').replace('{nbr}', currentOrder.vin)}</Heading>
                <Spacer spacing={Spacings.large} />
                {editingProposal !== 'second' && (
                  <>
                    <TextLabel>{text('Option1')}</TextLabel>
                    <DateTimeIntervalInput
                      value={date1}
                      onChange={setDate1}
                      isRequired={false}
                      isDisabled={false}
                      timezoneId={userLocation.timezone}
                      earliestDate={''}
                    />
                    <Spacer spacing={Spacings.large} />
                  </>
                )}
                {editingProposal !== 'first' && (
                  <>
                    <TextLabel>{text('Option2')}</TextLabel>
                    <DateTimeIntervalInput
                      value={date2}
                      onChange={setDate2}
                      isRequired={false}
                      isDisabled={false}
                      timezoneId={userLocation.timezone}
                      earliestDate={''}
                    />
                    <Spacer spacing={Spacings.large} />
                  </>
                )}

                <Row crossAxisAlignment={CrossAxisAlignments.center}>
                  <PrimaryButton
                    disabled={date1 === null && date2 === null}
                    onClick={() => {
                      const newDates: typeof proposals = [date1, date2]
                        .filter(x => x != null)
                        .map(x => ({
                          ordernumber: currentOrder.orderNumber,
                          start: convertToUtc(x?.isoDate ?? '', x?.start ?? ''),
                          end: convertToUtc(x?.isoDate ?? '', x?.end ?? '')
                        }));
                      setProposals(newDates);
                      setEditingProposal('none');
                    }}
                  >
                    {text('Save')}
                  </PrimaryButton>
                  <Spacer spacing={Spacings.large} orientation={Orientations.horizontal} />
                  <TextButton
                    icon={Icons.closeCircle}
                    onClick={() => {
                      if (editingProposal === 'first') {
                        setProposals(prev => prev.slice(1));
                      }
                      if (editingProposal === 'second') {
                        setProposals(prev => prev.slice(0, 1));
                      }
                      setEditingProposal('none');
                    }}
                  >
                    {text('DeleteOption')}
                  </TextButton>
                </Row>
              </>
            )}
          </Dialog>
        )}
      </div>
    </>
  );
};

export default CalendarContainer;