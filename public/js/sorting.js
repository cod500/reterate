$(document).ready(function () {
    //Sorting of indivisual restaurants
    $('#sort-restaurant').on('change', function () {
        let method = $(this).val(); // get selected value
        console.log(method)
        let id = $('select option:selected').attr('class')

        if (method === 'Highest Rating') { // require a URL
            let url = `/restaurant/sort/${id}/highest`
            console.log(url);
            window.location = url;
        } else if (method === 'Lowest Rating') {
            let url = `/restaurant/sort/${id}/lowest`
            console.log(url)
            window.location = url;
        } else if (method === 'Most Recent') {
            let url = `/restaurant/sort/${id}/recent`
            console.log(url)
            window.location = url;
        } else {
            return false;
        }

    });

    //Sorting of all restaurants
    $('#sort-restaurants').on('change', function () {
        let method = $(this).val(); // get selected value
        console.log(method)

        if (method === 'Highest Rating') { // require a URL
            let url = `/restaurants/highest`
            console.log(url);
            window.location = url;
        } else if (method === 'Lowest Rating') {
            let url = `/restaurants/lowest`
            console.log(url)
            window.location = url;
        } else if (method === 'Most Recent') {
            let url = `/restaurants/recent`
            console.log(url)
            window.location = url;
        } else {
            return false;
        }

    });

});