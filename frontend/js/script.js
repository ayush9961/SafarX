
// ==========================================
// RAASTA: COMMON DATE SETUP
// ==========================================

const today = new Date();

const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];


// ==========================================
// LOCAL STORAGE FUNCTIONS
// ==========================================

function getJourneys() {

    const savedJourneys = localStorage.getItem("raastaJourneys");

    return savedJourneys ? JSON.parse(savedJourneys) : [];

}


function saveJourneys(journeys) {

    localStorage.setItem(
        "raastaJourneys",
        JSON.stringify(journeys)
    );

}


// ==========================================
// DAY 5 + DAY 6: PASSENGER SEARCH
// ==========================================

const searchForm = document.getElementById("rideSearchForm");

const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const dateInput = document.getElementById("travelDate");
const passengerInput = document.getElementById("passengers");

const resultsContainer = document.getElementById("searchResults");

dateInput.min = localDate;


searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const from = fromInput.value.trim().toLowerCase();
    const to = toInput.value.trim().toLowerCase();

    const travelDate = dateInput.value;

    const requestedSeats = Number(passengerInput.value);


    // VALIDATION

    if (from === to) {

        alert("Source and destination cannot be the same.");
        return;

    }

    if (travelDate < localDate) {

        alert("Please select a valid future date.");
        return;

    }


    // GET SAVED JOURNEYS

    const journeys = getJourneys();


    // FIND MATCHING JOURNEYS

    
// ==========================================
// FLEXIBLE DATE DISCOVERY: ±3 DAYS
// ==========================================

// CONVERT SELECTED DATE INTO TIMESTAMP

const selectedDateTimestamp =
    Date.parse(travelDate + "T00:00:00Z");

// FIND JOURNEYS MATCHING ROUTE AND SEAT REQUIREMENTS

const routeJourneys = journeys.filter(function(journey) {

    const journeyFrom = String(
        journey.from || journey.source || ""
    ).trim().toLowerCase();

    const journeyTo = String(
        journey.to || journey.destination || ""
    ).trim().toLowerCase();

    const journeyDateTimestamp =
        Date.parse(journey.date + "T00:00:00Z");

    return (
        journeyFrom === from &&
        journeyTo === to &&
        Number(journey.seats) >= requestedSeats &&
        Number.isFinite(journeyDateTimestamp) &&
        journey.date >= localDate
    );
});

// SEPARATE EXACT DATE MATCHES

const matchingJourneys = routeJourneys.filter(function(journey) {
    return journey.date === travelDate;
});

// FIND NEARBY DATE MATCHES

const nearbyJourneys = routeJourneys.filter(function(journey) {

    const journeyDateTimestamp =
        Date.parse(journey.date + "T00:00:00Z");

    const differenceInDays = Math.round(
        (journeyDateTimestamp - selectedDateTimestamp) /
        (1000 * 60 * 60 * 24)
    );

    return (
        differenceInDays !== 0 &&
        Math.abs(differenceInDays) <= 3
    );
});

// SORT BY LOWEST CONTRIBUTION

function sortByContribution(list) {

    list.sort(function(a, b) {

        const amountA = Number(a.contributionPerPassenger);
        const amountB = Number(b.contributionPerPassenger);

        const validA = Number.isFinite(amountA) && amountA > 0;
        const validB = Number.isFinite(amountB) && amountB > 0;

        if (!validA) return 1;
        if (!validB) return -1;

        return amountA - amountB;
    });
}

sortByContribution(matchingJourneys);
sortByContribution(nearbyJourneys);


    // CLEAR PREVIOUS RESULTS

    resultsContainer.replaceChildren();


    const heading = document.createElement("h3");

    heading.textContent = "Available Rides";

    resultsContainer.appendChild(heading);


  // SHOW MESSAGE IF NO EXACT DATE MATCHES

if (matchingJourneys.length === 0) {

    const message = document.createElement("p");

    message.textContent =
        "No exact-date rides found. Checking nearby dates...";

    resultsContainer.appendChild(message);
}


    // DISPLAY MATCHING JOURNEYS

    matchingJourneys.forEach(function(journey) {

        const card = document.createElement("div");

        card.className = "journey-card";


        const route = document.createElement("h4");

        route.textContent =
            journey.from + " → " + journey.to;


        const date = document.createElement("p");

        date.textContent =
            "Date: " + journey.date;


        const time = document.createElement("p");

        time.textContent =
            "Departure: " + journey.time;


        const seats = document.createElement("p");

        seats.textContent =
            "Available seats: " + journey.seats;

            // DISPLAY CONTRIBUTION AMOUNT

const contribution = document.createElement("p");

const contributionAmount =
    Number(journey.contributionPerPassenger);

if (
    Number.isFinite(contributionAmount) &&
    contributionAmount > 0
) {
    contribution.textContent =
        "Estimated contribution: ₹" +
        contributionAmount +
        " per passenger";
} else {
    contribution.textContent =
        "Contribution amount: Not available";
}

contribution.className = "journey-contribution";

// DISPLAY ESTIMATED TOTAL CONTRIBUTION

const estimatedTotal = document.createElement("p");

if (
    Number.isFinite(contributionAmount) &&
    contributionAmount > 0
) {
    estimatedTotal.textContent =
        "Estimated total for " + requestedSeats +
        " passenger(s): ₹" +
        (contributionAmount * requestedSeats);
}

        const vehicle = document.createElement("p");


        vehicle.textContent =
            "Vehicle: " + journey.vehicle;


        // DISPLAY DRIVER NAME

        const driver = document.createElement("p");

        driver.textContent =
            "Driver: " + journey.driverName;


        // DISPLAY DRIVER MOBILE NUMBER

        const driverPhone = document.createElement("p");

        driverPhone.textContent =
            "Driver Mobile: " + journey.driverPhone;


       // SELECT DRIVER CHECKBOX

const selectLabel = document.createElement("label");

const selectBox = document.createElement("input");

selectBox.type = "checkbox";

selectBox.className = "driver-select-checkbox";

selectBox.value = String(journey.id);

selectBox.dataset.journeyId = String(journey.id);

selectLabel.appendChild(selectBox);

selectLabel.appendChild(
    document.createTextNode(" Select this driver")
);


// ADD ELEMENTS TO CARD

card.appendChild(route);

card.appendChild(date);

card.appendChild(time);

card.appendChild(seats);

card.appendChild(contribution);
card.appendChild(estimatedTotal);

card.appendChild(vehicle);

card.appendChild(driver);

card.appendChild(selectLabel);


resultsContainer.appendChild(card);

});

// ==========================================
// DISPLAY NEARBY DATE RIDES (WITHIN ±3 DAYS)
// ==========================================

if (nearbyJourneys.length > 0) {

    const nearbyHeading = document.createElement("h3");

    nearbyHeading.textContent =
        "Nearby Date Rides (within ±3 days)";

    resultsContainer.appendChild(nearbyHeading);

    nearbyJourneys.forEach(function(journey) {

        const card = document.createElement("div");

        card.className = "journey-card nearby-journey-card";

        // CALCULATE DATE DIFFERENCE

        const journeyTimestamp =
            Date.parse(journey.date + "T00:00:00Z");

        const differenceInDays = Math.round(
            (journeyTimestamp - selectedDateTimestamp) /
            (1000 * 60 * 60 * 24)
        );

        const dateDifference = document.createElement("p");

        dateDifference.textContent =
            Math.abs(differenceInDays) +
            " day(s) " +
            (differenceInDays < 0 ? "earlier" : "later") +
            " than your selected date";

        // ROUTE

        const route = document.createElement("h4");

        route.textContent = journey.from + " → " + journey.to;

        // ACTUAL TRAVEL DATE

        const date = document.createElement("p");

        date.textContent = "Actual Travel Date: " + journey.date;

        // DEPARTURE TIME

        const time = document.createElement("p");

        time.textContent = "Departure: " + journey.time;

        // AVAILABLE SEATS

        const seats = document.createElement("p");

        seats.textContent = "Available seats: " + journey.seats;

        // CONTRIBUTION

        const contribution = document.createElement("p");

        const contributionAmount =
            Number(journey.contributionPerPassenger);

        if (
            Number.isFinite(contributionAmount) &&
            contributionAmount > 0
        ) {
            contribution.textContent =
                "Estimated contribution: ₹" +
                contributionAmount + " per passenger";
        } else {
            contribution.textContent =
                "Contribution amount: Not available";
        }

        // ESTIMATED TOTAL

        const estimatedTotal = document.createElement("p");

        if (
            Number.isFinite(contributionAmount) &&
            contributionAmount > 0
        ) {
            estimatedTotal.textContent =
                "Estimated total for " + requestedSeats +
                " passenger(s): ₹" +
                (contributionAmount * requestedSeats);
        }

        // VEHICLE

        const vehicle = document.createElement("p");

        vehicle.textContent = "Vehicle: " + journey.vehicle;

        // DRIVER

        const driver = document.createElement("p");

        driver.textContent = "Driver: " + journey.driverName;

        // DRIVER PHONE

        const driverPhone = document.createElement("p");

        driverPhone.textContent =
            "Driver Mobile: " + journey.driverPhone;

        // EXPLICIT ALTERNATIVE DATE SELECTION

        const selectLabel = document.createElement("label");

        const selectBox = document.createElement("input");

        selectBox.type = "checkbox";

        selectBox.className = "driver-select-checkbox";

        selectBox.value = String(journey.id);

        selectBox.dataset.journeyId = String(journey.id);

        selectLabel.appendChild(selectBox);

        selectLabel.appendChild(
            document.createTextNode(
                " I agree to travel on " + journey.date +
                " (alternative date) and select this driver"
            )
        );

        // ADD DETAILS TO CARD

        card.appendChild(route);

        card.appendChild(dateDifference);

        card.appendChild(date);

        card.appendChild(time);

        card.appendChild(seats);

        card.appendChild(contribution);

        card.appendChild(estimatedTotal);

        card.appendChild(vehicle);

        card.appendChild(driver);

        card.appendChild(driverPhone);

        card.appendChild(selectLabel);

        resultsContainer.appendChild(card);

    });

}// SHOW MESSAGE IF NO RIDES ARE AVAILABLE

if (
    matchingJourneys.length === 0 &&
    nearbyJourneys.length === 0
) {
    const noRidesMessage = document.createElement("p");

    noRidesMessage.textContent =
        "No rides found on your selected date or within ±3 days. Try another date or route.";

    resultsContainer.appendChild(noRidesMessage);
}

// SHOW SEND REQUESTS BUTTON ONLY WHEN RIDES EXIST

if (
    matchingJourneys.length > 0 ||
    nearbyJourneys.length > 0
) {

    const sendRequestsButton = document.createElement("button");

    sendRequestsButton.type = "button";

    sendRequestsButton.id = "sendMultiDriverRequests";

    sendRequestsButton.className = "book-ride-btn";

    sendRequestsButton.textContent =
        "Send Requests to Selected Drivers";

    resultsContainer.appendChild(sendRequestsButton);

}

});


// ==========================================
// DAY 4 + DAY 5 + DAY 6: DRIVER JOURNEY
// PUBLISHING
// ==========================================

const publishForm = document.getElementById("publishRideForm");

const driverFrom = document.getElementById("driverFrom");

const driverTo = document.getElementById("driverTo");


// DRIVER DETAILS INPUTS

const driverNameInput = document.getElementById("driverName");

const driverPhoneInput = document.getElementById("driverPhone");


const driverDate = document.getElementById("driverDate");

const departureTime = document.getElementById("departureTime");

const availableSeats = document.getElementById("availableSeats");

const vehicleType = document.getElementById("vehicleType");
const contributionInput = document.getElementById("journeyContribution");
const publishMessage = document.getElementById("publishMessage");


driverDate.min = localDate;


// DRIVER FORM SUBMISSION

publishForm.addEventListener("submit", function(event) {

    event.preventDefault();


    // GET DRIVER FORM VALUES

    const from = driverFrom.value.trim();

    const to = driverTo.value.trim();

    const driverName = driverNameInput.value.trim();

    const driverPhone = driverPhoneInput.value.trim();

    const date = driverDate.value;

    const time = departureTime.value;

    const seats = Number(availableSeats.value);

    const vehicle = vehicleType.value;
    const contributionAmount = Number(contributionInput.value);


    // VALIDATION

    if (from.toLowerCase() === to.toLowerCase()) {

        alert("Source and destination cannot be the same.");

        return;

    }


    if (date < localDate) {

        alert("Please select a valid future date.");

        return;

    }


    if (!/^[0-9]{10}$/.test(driverPhone)) {

        alert("Please enter a valid 10-digit driver mobile number.");

        return;

    }

    if (!Number.isFinite(contributionAmount) || contributionAmount <= 0) {
    alert("Please enter a valid contribution amount.");
    return;
}

    // CREATE NEW JOURNEY

   const newJourney = {
    id: Date.now(),
    from: from,
    to: to,
    driverName: driverName,
    driverPhone: driverPhone,
    date: date,
    time: time,
    seats: seats,
    vehicle: vehicle,
    contributionPerPassenger: contributionAmount
};

    // GET EXISTING JOURNEYS

    const journeys = getJourneys();


    // ADD NEW JOURNEY

    journeys.push(newJourney);


    // SAVE JOURNEYS

    saveJourneys(journeys);


    // SUCCESS MESSAGE

    publishMessage.textContent =
        "Your journey has been published successfully!";


    console.log("Published Journey:", newJourney);


    // RESET FORM

    publishForm.reset();

    driverDate.min = localDate;

});



// ==========================================
// DAY 9: MULTIPLE DRIVER BOOKING REQUESTS
// ==========================================

resultsContainer.addEventListener("click", function(event) {

    const sendButton = event.target.closest(
        "#sendMultiDriverRequests"
    );

    if (!sendButton) {
        return;
    }

    // PASSENGER DETAILS

    const passengerName = document
        .getElementById("passengerName")
        .value.trim();

    const passengerPhone = document
        .getElementById("passengerPhone")
        .value.trim();

    const requestedSeats = Number(passengerInput.value);

    // VALIDATION

    if (!passengerName) {
        alert("Please enter your name.");
        return;
    }

    if (!/^[0-9]{10}$/.test(passengerPhone)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    // GET SELECTED DRIVERS

    const selectedBoxes = resultsContainer.querySelectorAll(
        ".driver-select-checkbox:checked"
    );

    const selectedIds = Array.from(selectedBoxes).map(function(box) {
        return String(box.dataset.journeyId);
    });

    if (selectedIds.length === 0) {
        alert("Please select at least one driver.");
        return;
    }

    // GET SELECTED JOURNEYS

    const journeys = getJourneys();

    const selectedJourneys = journeys.filter(function(journey) {
        return selectedIds.includes(String(journey.id));
    });

    if (selectedJourneys.length !== selectedIds.length) {
        alert("Some selected journeys are unavailable. Search again.");
        return;
    }

    // DAY 14: VERIFY SEAT AVAILABILITY BEFORE SENDING REQUESTS

const insufficientSeats = selectedJourneys.some(function(journey) {

    const availableSeats = Number(journey.seats);

    return (
        !Number.isFinite(availableSeats) ||
        availableSeats < requestedSeats
    );

});

if (insufficientSeats) {

    alert(
        "Some selected rides no longer have enough available seats. Please search again."
    );

    return;
}

    // GET EXISTING BOOKINGS

    const bookings = JSON.parse(
        localStorage.getItem("raastaBookings") || "[]"
    );

    // DAY 14: PREVENT DUPLICATE BOOKING REQUESTS

const activeStatuses = [
    "PENDING",
    "DRIVER_ACCEPTED",
    "PASSENGER_SELECTED",
    "CONFIRMED"
];

const duplicateRequest = selectedJourneys.some(function(journey) {

    return bookings.some(function(booking) {

        return (
            booking.passengerPhone === passengerPhone &&
            Number(booking.journeyId) === Number(journey.id) &&
            activeStatuses.includes(booking.status)
        );

    });

});

if (duplicateRequest) {

    alert(
        "You already have an active request or booking for one of these journeys."
    );

    return;
}
    // CREATE REQUEST GROUP

    const requestGroupId = "GROUP-" + Date.now();

    const createdAt = new Date().toISOString();

    // CREATE INDIVIDUAL REQUESTS

    const newRequests = selectedJourneys.map(function(journey, index) {

        return {
            bookingId: Date.now() + index,
            requestGroupId: requestGroupId,
            journeyId: journey.id,
            passengerName: passengerName,
            passengerPhone: passengerPhone,
            seatsRequested: requestedSeats,
            status: "PENDING",
            createdAt: createdAt
        };

    });

    // SAVE BOOKINGS

    bookings.push(...newRequests);

    localStorage.setItem(
        "raastaBookings",
        JSON.stringify(bookings)
    );

    // SAVE REQUEST GROUP

    const requestGroups = JSON.parse(
        localStorage.getItem("raastaRequestGroups") || "[]"
    );

    requestGroups.push({
        requestGroupId: requestGroupId,
        passengerName: passengerName,
        passengerPhone: passengerPhone,
        requestedSeats: requestedSeats,
        journeyIds: selectedJourneys.map(function(journey) {
            return journey.id;
        }),
        status: "OPEN",
        createdAt: createdAt
    });

    localStorage.setItem(
        "raastaRequestGroups",
        JSON.stringify(requestGroups)
    );

    alert(
        "Your request has been sent to " +
        newRequests.length +
        " drivers successfully!"
    );

    console.log("Multiple Driver Requests:", newRequests);

});


// driver dashboard 


// ==========================================
// DAY 7: DRIVER BOOKING MANAGEMENT
// ==========================================

const driverBookingLookupForm =
    document.getElementById("driverBookingLookupForm");

const dashboardDriverPhone =
    document.getElementById("dashboardDriverPhone");

const driverBookingResults =
    document.getElementById("driverBookingResults");


// DISPLAY DRIVER BOOKING REQUESTS

function displayDriverBookings(driverPhone) {

    driverBookingResults.replaceChildren();

    const journeys = getJourneys();

    const bookings = JSON.parse(
        localStorage.getItem("raastaBookings") || "[]"
    );

    // FIND JOURNEYS PUBLISHED BY THIS DRIVER

    const driverJourneys = journeys.filter(function(journey) {

        return journey.driverPhone === driverPhone;

    });

    if (driverJourneys.length === 0) {

        const message = document.createElement("p");

        message.textContent =
            "No journeys found for this mobile number.";

        driverBookingResults.appendChild(message);

        return;

    }

    // FIND BOOKINGS FOR DRIVER JOURNEYS

    const driverJourneyIds = driverJourneys.map(function(journey) {
        return Number(journey.id);
    });

    const driverBookings = bookings.filter(function(booking) {

        return driverJourneyIds.includes(Number(booking.journeyId));

    });

    const heading = document.createElement("h3");

    heading.textContent = "Your Booking Requests";

    driverBookingResults.appendChild(heading);

    if (driverBookings.length === 0) {

        const message = document.createElement("p");

        message.textContent =
            "No passenger booking requests received yet.";

        driverBookingResults.appendChild(message);

        return;

    }

    // DISPLAY EACH BOOKING

    driverBookings.forEach(function(booking) {

        const journey = driverJourneys.find(function(item) {

            return Number(item.id) === Number(booking.journeyId);

        });

        if (!journey) {
            return;
        }

        const card = document.createElement("div");

        card.className = "driver-booking-card";


        const route = document.createElement("h3");

        route.textContent =
            journey.from + " → " + journey.to;


        const passenger = document.createElement("p");

        passenger.textContent =
            "Passenger Name: " + booking.passengerName;


        const passengerPhone = document.createElement("p");

        passengerPhone.textContent =
            "Passenger Mobile: " + booking.passengerPhone;


        const requestedSeats = document.createElement("p");

        requestedSeats.textContent =
            "Seats Requested: " + booking.seatsRequested;


        const journeyDate = document.createElement("p");

        journeyDate.textContent =
            "Travel Date: " + journey.date;


        const status = document.createElement("p");

        status.textContent =
            "Booking Status: " + booking.status;


        card.appendChild(route);

        card.appendChild(passenger);

        card.appendChild(passengerPhone);

        card.appendChild(requestedSeats);

        card.appendChild(journeyDate);

        card.appendChild(status);


        // SHOW BUTTONS ONLY FOR PENDING REQUESTS

        if (booking.status === "PENDING") {

            const acceptButton = document.createElement("button");

            acceptButton.type = "button";

            acceptButton.className = "accept-booking-btn";

            acceptButton.textContent = "Accept";


            acceptButton.dataset.bookingId = booking.bookingId;


            const rejectButton = document.createElement("button");

            rejectButton.type = "button";

            rejectButton.className = "reject-booking-btn";

            rejectButton.textContent = "Reject";


            rejectButton.dataset.bookingId = booking.bookingId;


            card.appendChild(acceptButton);

            card.appendChild(rejectButton);

        }

        driverBookingResults.appendChild(card);

    });

}


// ==========================================
// DRIVER LOOKUP FORM
// ==========================================

driverBookingLookupForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const driverPhone = dashboardDriverPhone.value.trim();

    if (!/^[0-9]{10}$/.test(driverPhone)) {

        alert("Please enter a valid 10-digit mobile number.");

        return;

    }

    displayDriverBookings(driverPhone);

});


// ==========================================
// ACCEPT OR REJECT BOOKING
// ==========================================

driverBookingResults.addEventListener("click", function(event) {

    const acceptButton =
        event.target.closest(".accept-booking-btn");

    const rejectButton =
        event.target.closest(".reject-booking-btn");

    if (!acceptButton && !rejectButton) {
        return;
    }

    const bookingId = Number(
        (acceptButton || rejectButton).dataset.bookingId
    );

    const driverPhone = dashboardDriverPhone.value.trim();

    const bookings = JSON.parse(
        localStorage.getItem("raastaBookings") || "[]"
    );

    const journeys = getJourneys();


    // FIND BOOKING

    const selectedBooking = bookings.find(function(booking) {

        return Number(booking.bookingId) === bookingId;

    });

    if (!selectedBooking || selectedBooking.status !== "PENDING") {

        alert("This booking request is no longer pending.");

        displayDriverBookings(driverPhone);

        return;

    }


    // FIND JOURNEY

    const selectedJourney = journeys.find(function(journey) {

        return Number(journey.id) ===
            Number(selectedBooking.journeyId);

    });


    if (!selectedJourney ||
        selectedJourney.driverPhone !== driverPhone) {

        alert("You are not authorised to manage this booking.");

        return;

    }


   
// DRIVER ACCEPTS REQUEST

if (acceptButton) {

    const availableSeats = Number(selectedJourney.seats);

    const requestedSeats = Number(selectedBooking.seatsRequested);

    if (availableSeats < requestedSeats) {

        alert("Not enough seats are available.");

        return;

    }

    selectedBooking.status = "DRIVER_ACCEPTED";

    localStorage.setItem(
        "raastaBookings",
        JSON.stringify(bookings)
    );

    // UPDATE REQUEST GROUP

    if (selectedBooking.requestGroupId) {

        const groups = JSON.parse(
            localStorage.getItem("raastaRequestGroups") || "[]"
        );

        const group = groups.find(function(item) {

            return item.requestGroupId ===
                selectedBooking.requestGroupId;

        });

        if (group) {

            group.status = "DRIVER_OPTIONS_AVAILABLE";

            localStorage.setItem(
                "raastaRequestGroups",
                JSON.stringify(groups)
            );

        }

    }

    alert("You accepted the request. The passenger can now see your offer.");

}


// DRIVER REJECTS REQUEST

if (rejectButton) {

    selectedBooking.status = "DRIVER_REJECTED";

    localStorage.setItem(
        "raastaBookings",
        JSON.stringify(bookings)
    );

    alert("Booking request rejected.");

}



    // REFRESH DRIVER DASHBOARD

    displayDriverBookings(driverPhone);

});



// ==========================================
// DAY 8: PASSENGER BOOKING STATUS DASHBOARD
// ==========================================

const passengerBookingLookupForm =
    document.getElementById("passengerBookingLookupForm");

const bookingPassengerPhone =
    document.getElementById("bookingPassengerPhone");

const passengerBookingResults =
    document.getElementById("passengerBookingResults");


// DISPLAY PASSENGER BOOKINGS

function displayPassengerBookings(passengerPhone) {

    passengerBookingResults.replaceChildren();

    // GET SAVED BOOKINGS AND JOURNEYS

    const bookings = JSON.parse(
        localStorage.getItem("raastaBookings") || "[]"
    );

    const journeys = getJourneys();


    // FIND BOOKINGS USING PASSENGER MOBILE NUMBER

    const passengerBookings = bookings.filter(function(booking) {

        return booking.passengerPhone === passengerPhone;

    });


    // DISPLAY HEADING

    const heading = document.createElement("h3");

    heading.textContent = "Your Booking History";

    passengerBookingResults.appendChild(heading);


    // CHECK IF BOOKINGS EXIST

    if (passengerBookings.length === 0) {

        const message = document.createElement("p");

        message.textContent =
            "No booking requests found for this mobile number.";

        passengerBookingResults.appendChild(message);

        return;

    }


    // DISPLAY EACH BOOKING

    passengerBookings.forEach(function(booking) {

        // FIND RELATED JOURNEY

        const journey = journeys.find(function(item) {

            return Number(item.id) === Number(booking.journeyId);

        });


        const card = document.createElement("div");

        card.className = "passenger-booking-card";


        // BOOKING ID

        const bookingId = document.createElement("p");

        bookingId.textContent =
            "Booking ID: " + booking.bookingId;


        // PASSENGER NAME

        const passengerName = document.createElement("p");

        passengerName.textContent =
            "Passenger: " + booking.passengerName;


        // JOURNEY ROUTE

        const route = document.createElement("h3");

        if (journey) {

            route.textContent =
                journey.from + " → " + journey.to;

        } else {

            route.textContent = "Journey details unavailable";

        }


        // TRAVEL DATE

        const date = document.createElement("p");

        date.textContent = journey
            ? "Travel Date: " + journey.date
            : "Travel Date: Unavailable";


        // DEPARTURE TIME

        const time = document.createElement("p");

        time.textContent = journey
            ? "Departure: " + journey.time
            : "Departure: Unavailable";


        // DRIVER NAME

        const driver = document.createElement("p");

        driver.textContent = journey
            ? "Driver: " + journey.driverName
            : "Driver: Unavailable";


        // REQUESTED SEATS

        const seats = document.createElement("p");

        seats.textContent =
            "Seats Requested: " + booking.seatsRequested;


        // BOOKING STATUS

        const status = document.createElement("p");

        status.textContent =
            "Booking Status: " + booking.status;

        status.className = "booking-status";


        // ADD DETAILS TO CARD

        card.appendChild(bookingId);

        card.appendChild(passengerName);

        card.appendChild(route);

        card.appendChild(date);

        card.appendChild(time);

        card.appendChild(driver);

        card.appendChild(seats);

        card.appendChild(status);

        // DAY 11: PASSENGER PAYMENT SUMMARY

if (booking.status === "PASSENGER_SELECTED" && journey) {

    const contribution = Number(journey.contributionPerPassenger);
    const requestedSeats = Number(booking.seatsRequested);

    const paymentSummary = document.createElement("div");
    paymentSummary.className = "payment-summary";

    const paymentHeading = document.createElement("h4");
    paymentHeading.textContent = "Payment Summary";

    paymentSummary.appendChild(paymentHeading);

    if (
        Number.isFinite(contribution) &&
        contribution > 0 &&
        Number.isFinite(requestedSeats) &&
        requestedSeats > 0
    ) {

        const perPassenger = document.createElement("p");
        perPassenger.textContent =
            "Contribution per passenger: ₹" + contribution;

        const seatDetails = document.createElement("p");
        seatDetails.textContent =
            "Seats requested: " + requestedSeats;

        const totalAmount = contribution * requestedSeats;

        const total = document.createElement("p");
        total.textContent = "Total contribution: ₹" + totalAmount;

        paymentSummary.appendChild(perPassenger);
        paymentSummary.appendChild(seatDetails);
        paymentSummary.appendChild(total);

        // CHECK PAYMENT STATUS

if (booking.paymentStatus === "SUCCESS") {

    const paidMessage = document.createElement("p");
    paidMessage.textContent =
        "Payment Status: SUCCESSFUL ✓";

    paymentSummary.appendChild(paidMessage);

} else {

    const payButton = document.createElement("button");

    payButton.type = "button";
    payButton.className = "pay-now-btn";

    payButton.textContent =
        booking.paymentStatus === "FAILED"
            ? "Retry Payment"
            : "Pay Now";

    payButton.dataset.bookingId = booking.bookingId;

    paymentSummary.appendChild(payButton);
}

    } else {

        const errorMessage = document.createElement("p");
        errorMessage.textContent =
            "Contribution amount is unavailable for this journey.";

        paymentSummary.appendChild(errorMessage);
    }

    card.appendChild(paymentSummary);
}
        // DAY 10: SELECT PREFERRED DRIVER

if (booking.status === "DRIVER_ACCEPTED") {

    const selectDriverButton = document.createElement("button");

    selectDriverButton.type = "button";

    selectDriverButton.className = "select-driver-btn";

    selectDriverButton.textContent = "Select This Driver";

    selectDriverButton.dataset.bookingId = booking.bookingId;

    card.appendChild(selectDriverButton);

}


        passengerBookingResults.appendChild(card);

    });

}


// ==========================================
// PASSENGER BOOKING LOOKUP FORM
// ==========================================

passengerBookingLookupForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const phone = bookingPassengerPhone.value.trim();


        // VALIDATE MOBILE NUMBER

        if (!/^[0-9]{10}$/.test(phone)) {

            alert("Please enter a valid 10-digit mobile number.");

            return;

        }


        // DISPLAY PASSENGER BOOKINGS

        displayPassengerBookings(phone);

    }
);

// ==========================================
// DAY 10: PASSENGER SELECTS PREFERRED DRIVER
// ==========================================

passengerBookingResults.addEventListener("click", function(event) {

    const selectButton = event.target.closest(".select-driver-btn");

    if (!selectButton) {
        return;
    }

    const bookingId = Number(selectButton.dataset.bookingId);

    const passengerPhone = bookingPassengerPhone.value.trim();

    // GET SAVED BOOKINGS

    const bookings = JSON.parse(
        localStorage.getItem("raastaBookings") || "[]"
    );

    // FIND SELECTED BOOKING

    const selectedBooking = bookings.find(function(booking) {

        return (
            Number(booking.bookingId) === bookingId &&
            booking.passengerPhone === passengerPhone
        );

    });

    if (!selectedBooking ||
        selectedBooking.status !== "DRIVER_ACCEPTED") {

        alert("This driver's offer is no longer available.");

        displayPassengerBookings(passengerPhone);

        return;
    }

    const requestGroupId = selectedBooking.requestGroupId;

    if (!requestGroupId) {

        alert("Request group information is missing.");

        return;
    }

    // UPDATE ALL REQUESTS IN THE SAME GROUP

    bookings.forEach(function(booking) {

        if (booking.requestGroupId !== requestGroupId) {
            return;
        }

        if (Number(booking.bookingId) === bookingId) {

            booking.status = "PASSENGER_SELECTED";

        } else if (
            booking.status === "PENDING" ||
            booking.status === "DRIVER_ACCEPTED"
        ) {

            booking.status = "CANCELLED_BY_SYSTEM";

        }

    });

    // SAVE UPDATED BOOKINGS

    localStorage.setItem(
        "raastaBookings",
        JSON.stringify(bookings)
    );

    // UPDATE REQUEST GROUP

    const requestGroups = JSON.parse(
        localStorage.getItem("raastaRequestGroups") || "[]"
    );

    const selectedGroup = requestGroups.find(function(group) {

        return group.requestGroupId === requestGroupId;

    });

    if (selectedGroup) {

        selectedGroup.status = "PASSENGER_SELECTED";

        selectedGroup.selectedBookingId = bookingId;

        selectedGroup.selectedJourneyId = selectedBooking.journeyId;

        localStorage.setItem(
            "raastaRequestGroups",
            JSON.stringify(requestGroups)
        );

    }

    alert("You selected your preferred driver successfully!");

    // REFRESH PASSENGER DASHBOARD

    displayPassengerBookings(passengerPhone);

});

// ==========================================
// DAY 11: SIMULATED PAYMENT HANDLER
// ==========================================

passengerBookingResults.addEventListener("click", function(event) {

    const payButton = event.target.closest(".pay-now-btn");

    if (!payButton) {
        return;
    }

    const bookingId = Number(payButton.dataset.bookingId);
    const passengerPhone = bookingPassengerPhone.value.trim();

    // GET BOOKINGS AND JOURNEYS

    const bookings = JSON.parse(
        localStorage.getItem("raastaBookings") || "[]"
    );

    const journeys = getJourneys();

    // FIND SELECTED BOOKING

    const booking = bookings.find(function(item) {
        return (
            Number(item.bookingId) === bookingId &&
            item.passengerPhone === passengerPhone
        );
    });

    if (!booking || booking.status !== "PASSENGER_SELECTED") {
        alert("This booking is not available for payment.");
        return;
    }

    if (booking.paymentStatus === "SUCCESS") {
        alert("Payment has already been completed.");
        return;
    }

    // FIND JOURNEY

    const journey = journeys.find(function(item) {
        return Number(item.id) === Number(booking.journeyId);
    });

    if (!journey) {
        alert("Journey details not found.");
        return;
    }

    // DAY 12: CHECK AVAILABLE SEATS BEFORE PAYMENT

const availableSeats = Number(journey.seats);
const requestedSeats = Number(booking.seatsRequested);

if (availableSeats < requestedSeats) {
    alert(
        "Sorry! Only " + availableSeats +
        " seats are currently available."
    );
    return;
}

    // CALCULATE PAYMENT

    const amount =
        Number(journey.contributionPerPassenger) *
        Number(booking.seatsRequested);

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Invalid payment amount.");
        return;
    }

    // SIMULATE PAYMENT RESULT

    const paymentSuccess = confirm(
        "Raasta Demo Payment\n\n" +
        "Amount: ₹" + amount + "\n\n" +
        "Click OK to simulate SUCCESS.\n" +
        "Click Cancel to simulate FAILURE."
    );

    const paymentId = "PAY-" + Date.now();

    const paymentRecord = {
        paymentId: paymentId,
        bookingId: booking.bookingId,
        passengerPhone: passengerPhone,
        amount: amount,
        status: paymentSuccess ? "SUCCESS" : "FAILED",
        createdAt: new Date().toISOString()
    };

    // SAVE PAYMENT RECORD

    const payments = JSON.parse(
        localStorage.getItem("raastaPayments") || "[]"
    );

    payments.push(paymentRecord);

    localStorage.setItem(
        "raastaPayments",
        JSON.stringify(payments)
    );

   // ==========================================
// DAY 12: BOOKING CONFIRMATION
// ==========================================

// UPDATE PAYMENT DETAILS

booking.paymentStatus = paymentRecord.status;
booking.paymentId = paymentId;
booking.paidAmount = paymentSuccess ? amount : 0;

// IF PAYMENT IS SUCCESSFUL

if (paymentSuccess) {

    // DEDUCT BOOKED SEATS

    journey.seats =
        Number(journey.seats) - requestedSeats;

    saveJourneys(journeys);

    // CONFIRM BOOKING

    booking.status = "CONFIRMED";

    // UPDATE REQUEST GROUP

    const requestGroups = JSON.parse(
        localStorage.getItem("raastaRequestGroups") || "[]"
    );

    const selectedGroup = requestGroups.find(function(group) {
        return group.requestGroupId === booking.requestGroupId;
    });

    if (selectedGroup) {
        selectedGroup.status = "CONFIRMED";

        localStorage.setItem(
            "raastaRequestGroups",
            JSON.stringify(requestGroups)
        );
    }
}

// SAVE UPDATED BOOKINGS

localStorage.setItem(
    "raastaBookings",
    JSON.stringify(bookings)
);

    // DISPLAY RESULT

    if (paymentSuccess) {
        alert("Demo payment successful! Payment ID: " + paymentId);
    } else {
        alert("Demo payment failed. You can retry.");
    }

    // REFRESH PASSENGER DASHBOARD

    displayPassengerBookings(passengerPhone);

});