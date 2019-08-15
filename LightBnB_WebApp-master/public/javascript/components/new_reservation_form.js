$(() => {
  const $newReservationForm = $(`
  <form action="/api/properties" method="post" id="new-Reservation-form" class="new-Reservation-form">
      <div class="new-Reservation-form__field-wrapper">
        <label for="start">Start date:</label>
        <input type="date" id="start" name="start_date" value="2018-07-22" min="2018-01-01" max="2020-12-31">
      </div>
      
      <div class="new-Reservation-form__field-wrapper">
        <label for="start">End date:</label>
        <input type="hidden" id="property_id" name="property_id" value="${localStorage.getItem('property_id')}">
        <input type="date" id="end" name="end_date" value="2018-07-22" min="2018-01-01" max="2020-12-31">
      </div>

      <div class="new-Reservation-form__field-wrapper">
        <button>Create</button>
        <a id="Reservation-form__cancel" href="#">Cancel</a>
      </div>
        
    </form>
  `);

  window.$newReservationForm = $newReservationForm;

  $newReservationForm.on('submit', function(event) {
    event.preventDefault();

    views_manager.show('none');

    const data = $(this).serialize();

    //Data contains a string like this: start_date=2018-07-22&property_id=259&end_date=2018-07-22

    submitReservation(data)
      .then(() => {
        views_manager.show('listings');
      })
      .catch(error => {
        console.error(error);
        views_manager.show('listings');
      });
  });

  $('body').on('click', '#Reservation-form__cancel', function() {
    views_manager.show('listings');
    return false;
  });
});
