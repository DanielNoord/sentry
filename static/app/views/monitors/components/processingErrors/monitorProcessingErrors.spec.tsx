// import {initializeOrg} from 'sentry-test/initializeOrg';
import {CheckinProcessingErrorFixture} from 'sentry-fixture/checkinProcessingError';

import {render, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import MonitorProcessingErrors from 'sentry/views/monitors/components/processingErrors/monitorProcessingErrors';

describe('MonitorProcessingErrors', () => {
  it('should group errors by type', async () => {
    const checkinErrors = [
      CheckinProcessingErrorFixture(),
      CheckinProcessingErrorFixture(),
      CheckinProcessingErrorFixture({errors: [{type: 1}, {type: 6}]}),
      CheckinProcessingErrorFixture({errors: [{type: 6}]}),
    ];

    const children =
      'Errors were encountered while ingesting check-ins for the selected projects';
    render(
      <MonitorProcessingErrors checkinErrors={checkinErrors}>
        {children}
      </MonitorProcessingErrors>
    );

    expect(screen.getByText(children)).toBeInTheDocument();
    await userEvent.click(screen.getByText(children));

    // Shows two different groups from a flattened list of errors
    expect(screen.getByText('3x')).toBeInTheDocument();
    expect(screen.getByText('Check-in already completed')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByText('Monitor disabled')).toBeInTheDocument();
  });

  it('should group errors by project and type', async () => {
    const {checkin: otherProjectCheckin} = CheckinProcessingErrorFixture();
    otherProjectCheckin.message.project_id = 2;

    const checkinErrors = [
      CheckinProcessingErrorFixture(),
      CheckinProcessingErrorFixture(),
      CheckinProcessingErrorFixture({errors: [{type: 1}, {type: 6}]}),
      CheckinProcessingErrorFixture({errors: [{type: 6}]}),
      CheckinProcessingErrorFixture({checkin: otherProjectCheckin}),
      CheckinProcessingErrorFixture({checkin: otherProjectCheckin}),
      CheckinProcessingErrorFixture({checkin: otherProjectCheckin, errors: [{type: 6}]}),
      CheckinProcessingErrorFixture({
        checkin: otherProjectCheckin,
        errors: [{type: 1}, {type: 6}],
      }),
    ];

    const children =
      'Errors were encountered while ingesting check-ins for the selected projects';
    render(
      <MonitorProcessingErrors checkinErrors={checkinErrors}>
        {children}
      </MonitorProcessingErrors>
    );

    expect(screen.getByText(children)).toBeInTheDocument();
    await userEvent.click(screen.getByText(children));

    // Shows two different groups from a flattened list of errors under two different projects
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
    expect(screen.getAllByText('3x')).toHaveLength(2);
    expect(screen.getAllByText('Check-in already completed')).toHaveLength(2);
    expect(screen.getAllByText('2x')).toHaveLength(2);
    expect(screen.getAllByText('Monitor disabled')).toHaveLength(2);
  });
});
